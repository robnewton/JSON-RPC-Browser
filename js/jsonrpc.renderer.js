function Renderer() {}

Renderer.init = function() {
	Renderer.loadedMethod = {};
	Renderer.methodListElementId = 'methods';
	Renderer.methodCountBadgeId = 'method-count';
	Renderer.tryitFormId = 'tryit-form';
	Renderer.tryitResponseId = 'tryit-response';
	Renderer.connectionPanelId = 'connection-panel';
	Renderer.parametersTableId = 'params-table';
	Renderer.methodNameId = 'method-name';
	Renderer.methodDescriptionId = 'method-desc';
	Renderer.methodSchemaId = 'schema-json';
	Renderer.newConnectionButtonId = 'new-connection-button';
	Renderer.connectionMenuId = 'connection-menu';
	Renderer.connectionFormId = 'connection-form';
	Renderer.connectionDisplay = 'connection-display';
}

Renderer.loadSourceFromNewForm = function() {
	ConnectionHelper.openConnection = new Connection(
		$('#name').val(), 
		$('#ajaxEndPoint').val(), 
		$('#socketEndPoint').val(),
		$('#path').val()
	);
	Renderer.loadSource();
	$('#'+Renderer.connectionPanelId).hide();
}

Renderer.loadSourceByRecentIndex = function(recentConnIndex) {
	ConnectionHelper.openConnection = new Connection(
		ConnectionHelper.recentConnections[recentConnIndex].name, 
		ConnectionHelper.recentConnections[recentConnIndex].ajaxUrl, 
		ConnectionHelper.recentConnections[recentConnIndex].socketUrl
	);
	Renderer.loadSource();
}

Renderer.loadSource = function() {
	ConnectionHelper.openConnection.connect();
	ConnectionHelper.openConnection.introspect(function(result){
		//console.log(result);
		SchemaHelper.init(result);
		$('#'+Renderer.connectionDisplay).html(SchemaHelper.schema.description);

		//Enrich the schema for easier processing
		for (var key in result.methods) {
			//console.log(key);
			result.methods[key].name = key;
			SchemaHelper.normalizeTypes(result.methods[key].params);
		}

		//Initialize and then render the method navigation menu
		Renderer.refreshMethods();
	})
}

Renderer.showResponse = function(result) {
	Renderer.appendToCallHistory();
	Renderer.generatePythonCode();
	$('#'+Renderer.tryitResponseId).text(JSON.stringify(result, null, 4));
	$('#'+Renderer.tryitResponseId).show();
	//console.log(result);
}

Renderer.showError = function(message, details) {
	console.log(message);
	$('#'+Renderer.tryitResponseId).text(details);
	$('#'+Renderer.tryitResponseId).show();
}

Renderer.appendToCallHistory = function() {
	var url = ConnectionHelper.openConnection.ajaxUrl + '?request='+JSON.stringify(ConnectionHelper.openConnection.conn.getPriorRequest());
	var now = new Date().getTime();
	var timestamp = timeStamp();
	$('#history-body').prepend(''+
		'<div class="alert alert-info alert-dismissable">'+
		'	<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'+
		'	<strong style="cursor: pointer;" data-toggle="collapse" data-target=".history-item-'+now+'">'+ConnectionHelper.openConnection.conn.getPriorRequest().method+'</strong><span class="caret"></span> <small class="history-item-'+now+'">'+timestamp+'</small>'+
		'	<div class="collapse history-item-'+now+'">'+
		'		<br>'+
		'		<pre>'+url+'</pre>'+
		'		<small>'+timestamp+'</small>'+
		'		<a href=\''+url+'\' target="_blank" class="alert-link pull-right">'+
		'			<small>Open in a New Tab</small>'+
		'		</a><br>'+
		'	</div>'+
		'</div>');
}

Renderer.filterMethods = function(element, what) {
    var value = $(element).val();
    if(value == '') {
		Renderer.refreshMethods();
    }else{
		Renderer.refreshMethods(false);
        $('#'+what+' > li > a:not(:contains(' + value + '))').hide();
        $('#'+what+' > li > a:contains(' + value + ')').show();
        $("#method-count").html($('#'+what+' > li > a:contains(' + value + ')').length);
    }
};

Renderer.methodHeaderClickHandler = function() {
	$(this).parent().parent().find("ul").hide();
	$(this).parent().find("ul").show();
}

Renderer.methodItemClickHandler = function() {
	if (methodListIsCategorized) {
		var header = $(this).parent().parent().parent().find(".method-list-header").text();
		Renderer.loadMethod(header + '.' + $(this).text());
	}else{
		Renderer.loadMethod($(this).text());
	}
}

var lastNamespace = '';
var methodListIsCategorized = false;

Renderer.refreshMethods = function(categorized) {
	if (typeof categorized === "undefined" || categorized===null) categorized = true;

    methodListIsCategorized = categorized;
	$(".method-list-item").off();
	$("#"+Renderer.methodListElementId).html('');
	for (var method in SchemaHelper.schema.methods) {
		if (categorized) {
			var split = SchemaHelper.schema.methods[method].name.split('.');
			var namespace = split[0] || '';
			var methodName = split.slice(1, split.length).join(".") || '';
			if (lastNamespace !== namespace) {
				$("#"+Renderer.methodListElementId).append('<li class="" id="method-list-header-'+namespace+'"><a href="#" data-toggle="pill" class="method-list-header">' + namespace + '</a><ul class="nav"></ul></li>');
			}
			$('#method-list-header-'+namespace).find("ul").append('<li class=""><a href="#" data-toggle="pill" class="method-list-item">' + methodName + '</a></li>');
			lastNamespace = namespace;
		}else{
			$("#"+Renderer.methodListElementId).append('<li><a href="#" class="method-list-item">' + SchemaHelper.schema.methods[method].name + '</a></li>');
		}
	}
	$(".method-list-header").on("click", Renderer.methodHeaderClickHandler);
	$(".method-list-item").on("click", Renderer.methodItemClickHandler);
	Renderer.updateMethodCountBadge(SchemaHelper.getMethodCount());
}

Renderer.updateMethodCountBadge = function(count) {
	$("#"+Renderer.methodCountBadgeId).html(count);
}

Renderer.loadMethod = function(methodName) {
	Renderer.loadedMethod = SchemaHelper.schema.methods[methodName];

	if (Renderer.loadedMethod === undefined){return;}

	var method = Renderer.loadedMethod;
	$('#tabs a[href="#try"]').tab('show');

	//Render the details tab
	$("#"+Renderer.parametersTableId).find("tr:gt(0)").remove();
	$("#"+Renderer.methodNameId).html(method.name);
	$("#"+Renderer.methodDescriptionId).html(method.description);

	//Render the schema tab
	$("#"+Renderer.methodSchemaId).text(JSON.stringify(method, null, 4));

	//Render the python tab
	//$("#python").text('');
	Renderer.generatePythonCode();
	
	//Render the try it tab
	$('#'+Renderer.tryitFormId).find('div.form-group').html('');

	//Render the parameters table in the details tab
	for (var i = 0; i < method.params.length; i++) {
		var parameter = method.params[i];
		var required = (parameter.required) ? 'true' : 'false';
		var type = (typeof parameter.$ref != 'undefined') ? parameter.type.id : parameter.type;
		$('#'+Renderer.parametersTableId+' > tbody:last').append('<tr><th>'+parameter.name+'</th><td>'+required+'</td><td>'+type+'</td><td>'+parameter.default+'</td></tr>');
	}

	//Render the form
	FormBuilder.buildForm(method);
}

Renderer.generatePythonCode = function() {
    $.ajax({
      type     : 'GET',
      url      : 'ftl/python-simple.ftl',
      cache    : false,

      success  : function(data) {
        $("#python-code").text(freemarker.render(data, {endpoint: ConnectionHelper.openConnection.ajaxEndPoint, path: ConnectionHelper.openConnection.path, jsonrpcrequest:  JSON.stringify(ConnectionHelper.openConnection.conn.getPriorRequest())}));
      },

      // JSON-RPC Server could return non-200 on error
      error    : function(jqXHR, textStatus, errorThrown) {
        try {
          if ('console' in window) console.log(jqXHR.responseText);
          if ('console' in window) console.log(response.error);
        }
        catch (err) {
          console.log(jqXHR.responseText);
        }
      }
    });
}

Renderer.initNavMenu = function() {
	$('#'+Renderer.newConnectionButtonId).on("click", function(){
		$('#'+Renderer.connectionPanelId).show();
	});
	Renderer.refreshRecentConnectionList();
}

Renderer.refreshRecentConnectionList = function() {
	$(".recent-connection").off();
	$(".recent-connection").find('li').remove();

	//Populate each of the recent connections
	for (var i = 0; i < ConnectionHelper.recentConnections.length; i++) {
		$("#"+Renderer.connectionMenuId).append('<li><a href="#" class="recent-connection" id="recent-connection-'+i+'">'+ConnectionHelper.recentConnections[i].name+'</a></li>');
	}

	$(".recent-connection").on("click", function(){
		var split = this.id.split('-');
		var id = split[split.length-1];
		console.log('Recent connection chosen: ' + ConnectionHelper.recentConnections[id]);
		Renderer.loadSourceByRecentIndex(id);
	});
}