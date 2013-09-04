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
		$('#ajaxUrl').val(), 
		$('#socketUrl').val()
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
		console.log(result);
		SchemaHelper.init(result);
		$('#'+Renderer.connectionDisplay).html(SchemaHelper.schema.description);

		//Enrich the schema for easier processing
		for (var key in result.methods) {
			result.methods[key].name = key;
			SchemaHelper.normalizeTypes(result.methods[key].params);
		}

		//Initialize and then render the method navigation menu
		Renderer.refreshMethods();
	})
}

Renderer.showResponse = function(result) {
	$('#'+Renderer.tryitResponseId).text(JSON.stringify(result, null, 4));
	$('#'+Renderer.tryitResponseId).show();
	console.log(result);
}

Renderer.showError = function(message, details) {
	console.log(message);
	$('#'+Renderer.tryitResponseId).text(details);
	$('#'+Renderer.tryitResponseId).show();
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
	var header = $(this).parent().parent().parent().find(".method-list-header").text();
	Renderer.loadMethod(header + '.' + $(this).text());
}

var lastNamespace = '';

Renderer.refreshMethods = function(categorized) {
	if (typeof categorized === "undefined" || categorized===null) categorized = true;

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

	//Render the details tab
	$("#"+Renderer.parametersTableId).find("tr:gt(0)").remove();
	$("#"+Renderer.methodNameId).html(method.name);
	$("#"+Renderer.methodDescriptionId).html(method.description);

	//Render the schema tab
	$("#"+Renderer.methodSchemaId).text(JSON.stringify(method, null, 4));

	//Render the python tab
	//$("#python").text('');
	
	//Render the try it tab
	//$('#'+Renderer.tryitFormId).find('fieldset').remove();
	//$('#'+Renderer.tryitFormId).find('button').remove();
	//$('#'+Renderer.tryitFormId).append('<fieldset id="tryit-form-required"><legend>Required</legend><div class="form-group"></div></fieldset>');
	//$('#'+Renderer.tryitFormId).append('<fieldset id="tryit-form-optional"><legend>Optional</legend><div class="form-group"></div></fieldset>');
	$('#'+Renderer.tryitFormId).find('div.form-group').html('');
	//$('#'+Renderer.tryitFormId).prepend('<button type="submit" class="btn btn-primary  btn-xs">Submit</button><p></p>');
	//$('#'+Renderer.tryitFormId).append('<button type="submit" class="btn btn-primary  btn-xs">Submit</button><p></p><p></p>');

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