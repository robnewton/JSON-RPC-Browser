function FormBuilder() {}

FormBuilder.init = function() {}

//Expects an enriched parameter definition (any references looked up)
//For each type allowed for the parameter (only used when multiple are
//	supported) an input element is generated. Each will have radio button
//	to allow the user to indicate which of the types he/she wishes to use.
//All inputs will be grouped into one radio button group and be wrapped
//	with a single fieldset to allow for the set to enabled/disabled all
//	at once if need be.

FormBuilder.buildForm = function() {
	//Naming pattern for element id's
	// "tryit-" + parameter.name + "-type" + type.index + "-" + element.type
	for (var i = 0; i < Renderer.loadedMethod.params.length; i++) {
		var parameter = Renderer.loadedMethod.params[i];
		var topFieldset = (parameter.required ? '#tryit-form-required' : '#tryit-form-optional');
		$(topFieldset + ' div.form-group').append(''+
			'<label class="col-lg-2 control-label tryit-optional-toggle" id="tryit-' + parameter.name + '-label" for="tryit-' + parameter.name + '-type1-input" title="' + (parameter.required ? parameter.name : 'Click here to enable the ' + parameter.name + ' optional parameter.') + '">'+
				parameter.name +
				//(parameter.required ? '' : '<br><button type="button" class="btn btn-primary btn-xs">Enable</button>') +
				(parameter.required ? '' : '<br><input type="checkbox"/>') +
			'</label>'+
			'<div class="col-lg-10 panel panel-primary" id="tryit-' + parameter.name + '-div">'+
				'<div class="panel-body">'+
					'<fieldset id="tryit-' + parameter.name + '-fieldset" '+(parameter.required ? '' : 'disabled')+'  style="width:100%">'+
					'</fieldset>'+
				'</div>'+
			'</div>');
		FormBuilder.autoBuildInput($('#tryit-' + parameter.name + '-fieldset'), parameter, 'tryit-' + parameter.name );
	}

	//Clear and hide the results pane
	$('#'+Renderer.tryitResponseId).text('');
	$('#'+Renderer.tryitResponseId).hide();

	//Attach click handler to all type picker buttons
	$("#tryit-form :button.tryit-type-picker").off();
	$("#tryit-form :button.tryit-type-picker").on('click', function () {
		FormBuilder.handleTypePickerClick(this.id);
	});

	//Attach switch-change handler to all optional parameter enablement toggle switches
	$("#tryit-form .tryit-optional-toggle").off();
	$("#tryit-form .tryit-optional-toggle").on('click', function () {
		FormBuilder.handleOptionalParameterToggle(this.id);
	});

	//Attach a boolean toggle click handler to all boolean switches
	$("#tryit-form .tryit-boolean-toggle").off();
	$("#tryit-form .tryit-boolean-toggle").on('click', function () {
		FormBuilder.handleBooleanToggle(this.id);
	});

	$('#'+Renderer.tryitFormId).off();
	$('#'+Renderer.tryitFormId).submit(function() {
        FormBuilder.handleFormSubmit();
        return false;
    });

	$("#tryit-form .pillbox-add").off();
	$("#tryit-form .pillbox-add").on('click', function () {
		FormBuilder.handlePillboxAdd(this.id);
	});
}

FormBuilder.handleFormSubmit = function(){
	try {
		window.scrollTo(0, 0);
	}catch(e){}

	var params = {};
	for (var i = 0; i < Renderer.loadedMethod.params.length; i++) {
		var parameter = Renderer.loadedMethod.params[i];
		var id = 'tryit-'+parameter.name;
		if (parameter.required == true) {
			params[parameter.name] = FormBuilder.getParameterValue(parameter, id);
		}else{
			if (!$('#'+id+'-fieldset').prop('disabled')) {
				params[parameter.name] = FormBuilder.getParameterValue(parameter, id);
			}
		}
	}
	//console.log(JSON.stringify(params));
	ConnectionHelper.openConnection.call(
		Renderer.loadedMethod.name,
		params,
		Renderer.showResponse
	);
}

FormBuilder.getParameterValue = function(param, id) {
	if (typeof id === "undefined" || id===null) id = "";
	
	if ($.isArray(param.type)) {
		return FormBuilder.getMultitypeInputValue(param, id);
	}else{
		return FormBuilder.autoGetInputValue(param, id);
	}
}

FormBuilder.getMultitypeInputValue = function(param, id) {
	if (typeof id === "undefined" || id===null) id = "";
	  
	if ($.isArray(param.type)) {
		for (var key = 0; key < param.type.length; key++) {
			if (!$('#'+id+'-type'+key+'-fieldset').prop('disabled')) {
				return FormBuilder.autoGetInputValue(param.type[key], id+'-type'+key+'-input');
			}
		}
	}else{
		console.log('Not a multitype parameter');
	}
}

FormBuilder.autoGetInputValue = function(param, id) {
	if (typeof id === "undefined" || id===null) id = "";

		
	if (typeof param.type !== "undefined") {
		switch (param.type) {
			case "boolean":
				return ($("[name='"+id+"-switch']:checked").val()==="true");
				break;
			case "integer":
				return parseInt($('#'+id).val());
				break;
			case "array":
				return FormBuilder.getPillBoxPills(id);
				break;
			case "string":
				if ($.isArray(param.enums)) {
					return $('#'+id).val();
				}else{
					return $('#'+id).val();
				}
				break;
			case "object":
				if (typeof param.properties != 'undefined') {
					var obj = {};
					for (var prop in param.properties) {
						obj[prop] = FormBuilder.autoGetInputValue(param.properties[prop], id + '-obj-' + prop);
					}
					return obj;
				}
				break;
			default:
				if ($.isArray(param.type)) {
					return FormBuilder.getMultitypeInputValue(param, id);
				}
				break;
		}
	}else{
		//There is no type, so check for the "items" array
		if (typeof param.items != 'undefined') {
			return FormBuilder.autoGetInputValue(param.items, id);
		}
	}
}

FormBuilder.handleBooleanToggle = function(sender){
	//id example: tryit-parameter-toggle
 	var split = sender.split("-");
 	var base = split.slice(0, split.length - 1).join("-");
    $('#'+base+'-fieldset').prop('disabled',!$('#'+base+'-fieldset').prop('disabled'));

	if ($(sender).val() === 'true') {
		$("[name='includeicon']:eq(0)").addClass('btn-success').find('i').addClass('icon-white');
		$("[name='includeicon']:eq(1)").removeClass('btn-danger').find('i').removeClass('icon-white');
		$('.hide_if_no_icon').show();
	} else {
		$("[name='includeicon']:eq(0)").removeClass('btn-success').find('i').removeClass('icon-white');
		$("[name='includeicon']:eq(1)").addClass('btn-danger').find('i').addClass('icon-white');
		$('.hide_if_no_icon').hide();
	}
}

FormBuilder.handleOptionalParameterToggle = function(sender){
	//id example: tryit-parameter-toggle
 	var split = sender.split("-");
 	var base = split.slice(0, split.length - 1).join("-");
    $('#'+base+'-fieldset').prop('disabled',!$('#'+base+'-fieldset').prop('disabled'));
}

FormBuilder.handleTypePickerClick = function(sender){
	//id example: tryit-parameter-type{$index}-picker
 	var split = sender.split("-");
 	var base = split.slice(0, split.length - 2).join("-");
 	var baseType = split.slice(0, split.length - 1).join("-");

	$("#tryit-form ."+base+"-type-fieldset").prop('disabled', true);
	$("#"+baseType+"-fieldset").prop('disabled', false);
	$("#tryit-form ."+base+"-panel").css("background-color", "#F2F2F2");
	$("#"+baseType+"-panel").css('background', 'transparent');
	$("#tryit-form :button."+base+"-picker").show();
	$('#'+sender).hide();
}

FormBuilder.handlePillboxAdd = function(sender){
	//id example: tryit-parameter--type{$index}-add
	var split = sender.split("-");
	var base = split.slice(0, split.length - 1).join("-");
	var input = base + '-input';
	var dropdown = base + '-dropdown';
	var value = $('#'+input).val();
	if (value != '') {
		if ($('#'+base).find('li:contains("'+value+'")').length < 1) {  //Is this pill unique
			if (($('#'+dropdown).find('a:contains("'+value+'")').length > 0) && ($('#'+base).hasClass('unique'))) {  //Is this pill allowed
				$('#'+base+' ul').append('<li class="status-primary">'+value+'</li>');
			}
		}
		$('#'+input).val('');
	}
}

FormBuilder.getPillBoxPills = function(pillBoxId){
	var items = $('#'+pillBoxId).pillbox('items');
	var pills = [];
	for (var i = 0; i < items.length; i++) {
		pills.push(items[i].text);
	};
	return pills;
}

FormBuilder.autoBuildInput = function(target, param, id) {
	if (typeof id === "undefined" || id===null) id = "";
	
	if (typeof param.circularReferences != 'undefined') {
		//Do not try to draw input
		target.append('Circular reference could not be rendered.');
	}else{
		if ($.isArray(param.type)) {
			FormBuilder.buildMultitypeInput(target, param, id);
		}else{
			FormBuilder.autoBuildInputElement(target, param, id);
		}
	}
}

FormBuilder.buildMultitypeInput = function(target, param, id) {
	if (typeof id === "undefined" || id===null) id = "";
	  
	if ($.isArray(param.type)) {
		//target.parent().prepend('<div class="panel-heading"><small>Pick a parameter type...</small><span class="badge pull-right">multitype</span></div>');
		//target.parent().prepend('<div class=""><small>Pick a parameter type...</small><span class="badge pull-right">multitype</span></div>');
		//target.parent().prepend('<small>Pick a parameter type...</small><span class="badge pull-right">multitype</span>');
		for (var key = 0; key < param.type.length; key++) {
			if (key === 0) {
				target.append('<div class="alert alert-danger"><strong>Multitype: </strong><small>Pick a parameter type...</small></div>');
			}
			target.append('<div class="panel panel-default clearfix '+id+'-panel" id="'+id+'-type'+key+'-panel"><div class="panel-body"><fieldset class="col-lg-11 '+id+'-type-fieldset" id="'+id+'-type'+key+'-fieldset"></fieldset><button type="button" class="btn btn-primary btn-xs col-lg-1 tryit-type-picker '+id+'-picker" id="'+id+'-type'+key+'-picker">Pick</button></div></div>');
			FormBuilder.autoBuildInputElement($('#'+id+'-type'+key+'-fieldset'), param.type[key], id+'-type'+key+'-input');
		}
		//Default the selected type to the first one in the list
		FormBuilder.handleTypePickerClick(id+'-type0-picker');
	}else{
		console.log('Not a multitype parameter');
	}
}

FormBuilder.buildMultitypeInput2 = function(target, param, id) {
	if (typeof id === "undefined" || id===null) id = "";
	  
	if ($.isArray(param.type)) {
		target.append('<div class="panel panel-primary"></div>');
		target.find('div:first').append('<div class="panel-heading"><small>Pick a parameter type...</small><span class="badge pull-right">multitype</span></div>');
		target.find('div:first').append('<div class="panel-body"></div>');
		for (var key = 0; key < param.type.length; key++) {
			target.find('div:last').append('<div class="panel panel-default '+id+'-panel" id="'+id+'-type'+key+'-panel"><div class="panel-body"><fieldset class="col-lg-11 '+id+'-type-fieldset" id="'+id+'-type'+key+'-fieldset"></fieldset><button type="button" class="btn btn-primary btn-xs col-lg-1 tryit-type-picker '+id+'-picker" id="'+id+'-type'+key+'-picker">Pick</button></div></div>');
			FormBuilder.autoBuildInputElement($('#'+id+'-type'+key+'-fieldset'), param.type[key], id+'-type'+key+'-input');
		}
		//Default the selected type to the first one in the list
		FormBuilder.handleTypePickerClick(id+'-type0-picker');
	}else{
		console.log('Not a multitype parameter');
	}
}

FormBuilder.autoBuildInputElement = function(target, param, id) {
	if (typeof id === "undefined" || id===null) id = "";

	if (typeof param.type !== "undefined") {
		switch (param.type) {
			case "boolean":
				FormBuilder.buildBooleanInput(target, param, id);
				break;
			case "integer":
				FormBuilder.buildIntegerInput(target, param, id);
				break;
			case "array":
				FormBuilder.buildArrayInput(target, param, id);
				break;
			case "string":
				if ($.isArray(param.enums)) {
					FormBuilder.buildEnumInput(target, param, id);
				}else{
					FormBuilder.buildTextInput(target, param, id);
				}
				break;
			case "object":
				if (typeof param.properties != 'undefined') {
					for (var prop in param.properties) {
						target.append('<label class="control-label">' + prop + '</label><br>');
						target.append('<div class="panel panel-primary clearfix"><div class="panel-body"></div></div>');
						FormBuilder.autoBuildInput(target.find('div:last'), param.properties[prop], id + '-obj-' + prop);
					}
				}
		}
	}else{
		//target.append('Param type unknown.');
		//There is no type, so check for the "items" array
		if (typeof param.items != 'undefined') {
			//TODO: What is the type if param.type doesn't exist?
			//target.append('Custom object with items element.');
			FormBuilder.autoBuildInputElement(target, param.items, id);
		}
	}
}

FormBuilder.buildArrayInput = function(target, param, id) {
	if (typeof id === "undefined" || id===null) id = "";
	
	if (param.type=='array') {
		var arrayInput = '';
		arrayInput += '' +
			'<div class="input-group">'+
				'<input type="text" class="form-control" id="'+id+'-input">'+
				'<div class="input-group-btn">'+
					'<button class="btn btn-primary pillbox-add" id="'+id+'-add" type="button">Add</button>'+
					'<button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" tabindex="-1">'+
						'<span class="caret"></span>'+
					'</button>'+
					'<ul class="dropdown-menu" id="'+id+'-dropdown">';
						for (var i = 0; i < param.items.enums.length; i++) {
							arrayInput += '<li><a href="#" onclick="$(\'#'+id+'-input\').val(this.text)">'+param.items.enums[i]+'</a></li>';
						};
						arrayInput += '' +
					'</ul>'+
				'</div>'+
			'</div><br>'+
			'<div class="well fuelux" style="">'+
				'<div id="'+id+'" class="pillbox'+((param.uniqueItems)?' unique':'')+'">'+
					'<ul>'+
					'</ul>'+
				'</div>'+
			'</div>';
		target.append(arrayInput);
		$('.dropdown-toggle').dropdown();
	}else{
		console.log('Not an array parameter');
	}
}

FormBuilder.buildTextInput = function(target, param, id, placeholder) {
	if (typeof id === "undefined" || id===null) id = "";
	if (typeof placeholder === "undefined" || placeholder===null) placeholder = "";
	
	if (param.type=='string') {
		var textInput = '';
		textInput += '<input type="text" class="form-control" id="'+id+'" placeholder="'+placeholder+'">';
		target.append(textInput);
	}else{
		console.log('Not a string parameter');
	}
}

FormBuilder.buildIntegerInput = function(target, param, id) {
	if (typeof id === "undefined" || id===null) id = "";
	
	if (param.type=='integer') {
		var textInput = '';
		textInput += '<input type="text" class="form-control" id="'+id+'" value="'+(param.maximum != 'undefined' ? param.default : '')+'">';
		target.append(textInput);
		if (param.maximum != 'undefined') {
			if (param.maximum > 0) {
				$('#'+id).slider({
					min: param.minimum,
					max: param.maximum
				});
			}
		}
	}else{
		console.log('Not an integer parameter');
	}
}

FormBuilder.buildEnumInput = function(target, param, id) {
	if (typeof id === "undefined" || id===null) id = "";
	
	if (($.isArray(param.enums)) && (param.type=='string')) {
		var enumInput = '<select class="form-control" id="'+id+'">';
		$.each(param.enums, function(key, value) {
			enumInput += '<option>'+value+'</option>';
		});
		enumInput += '</select>';
		target.append(enumInput);
	}else{
		console.log('Not a string enums parameter');
	}
}

FormBuilder.buildBooleanInput = function(target, param, id) {
	if (typeof id === "undefined" || id===null) id = "";
	
	if (param.type=='boolean') {
		var booleanInput = '';
		booleanInput += '<label class="radio-inline"><input class="myClass" type="radio" name="'+id+'-switch" id="'+id+'-switch-true" value="true" checked>True</label><label class="radio-inline"><input class="myClass" type="radio" name="'+id+'-switch" id="'+id+'-switch-false" value="false">False</label>';
		target.append(booleanInput);
	}else{
		console.log('Not a boolean parameter');
	}
}