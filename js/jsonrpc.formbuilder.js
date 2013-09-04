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
		$(topFieldset + ' div.form-group').append('<label class="col-lg-2 control-label tryit-optional-toggle" id="tryit-' + parameter.name + '-label" for="tryit-' + parameter.name + '-type1-input" title="' + (parameter.required ? parameter.name : 'Click here to enable the ' + parameter.name + ' optional parameter.') + '">' + parameter.name + '</label><div class="col-lg-10 panel panel-default clearfix" id="tryit-' + parameter.name + '-div"><fieldset id="tryit-' + parameter.name + '-fieldset" '+(parameter.required ? '' : 'disabled')+'></fieldset></div>');
		//<br><div class="make-switch switch-mini tryit-optional-toggle" id="tryit-' + parameter.name + '-toggle" data-on-label="<i class=\'switch-mini-font-icons fui-check icon-white\'></i>" data-off-label="<i class=\'switch-mini-font-icons fui-cross\'></i>"><input type="checkbox" /></div>
		//$('#tryit-' + parameter.name + '-label').append('<br><div class="make-switch switch-mini tryit-optional-toggle" id="tryit-' + parameter.name + '-toggle"><input type="checkbox" /></div>');
		$('#tryit-' + parameter.name + '-toggle').bootstrapSwitch();
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
        return FormBuilder.handleFormSubmit();
    });
}

FormBuilder.handleFormSubmit = function(){
    //console.log(JSON.stringify($('#tryit-form').serializeObject()));

	//Example of getting the value of the selected radio style button group
	//var includeicon=$("[name='includeicon'].active").val();

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
	console.log(params);
	ConnectionHelper.openConnection.call(
		Renderer.loadedMethod.name,
		params,
		Renderer.showResponse
	);
    return false;
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

FormBuilder.autoGetInputValue = function(typeDef, id) {
	if (typeof id === "undefined" || id===null) id = "";

	switch (typeDef.type) {
		case "boolean":
			return ($("[name='"+id+"-switch']").val()=="true");
			break;
		case "integer":
			return parseInt($('#'+id).val());
			break;
		case "array":
			return $('#'+id).val().split(',');
			break;
		case "string":
			if ($.isArray(typeDef.enums)) {
				return $('#'+id).val();
			}else{
				return $('#'+id).val();
			}
			break;
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
	//id example: tryit-parameter-type#-picker
 	var split = sender.split("-");
 	var base = split.slice(0, split.length - 2).join("-");
 	var baseType = split.slice(0, split.length - 1).join("-");

	//Loop through each fieldset and disable it
	$("#tryit-form ."+base+"-type-fieldset").prop('disabled', true);
	//Enable the selected fieldset
	$("#"+baseType+"-fieldset").prop('disabled', false);

	//Loop through each panel to change the background
	$("#tryit-form ."+base+"-panel").css("background-color", "#F2F2F2");
	//Change the background of the selected panel to default
	$("#"+baseType+"-panel").css('background', 'transparent');

	//Loop through each button and display it and make it available to be clicked
	//$("#tryit-form :button."+base+"-picker").prop('disabled', false);
	$("#tryit-form :button."+base+"-picker").show();
	//Change the color of the clicked button to something indicating disabled (or selected)
	//$('#'+sender).prop('disabled', true);
	$('#'+sender).hide();
}

FormBuilder.autoBuildInput = function(target, param, id) {
	if (typeof id === "undefined" || id===null) id = "";
	
	if ($.isArray(param.type)) {
		FormBuilder.buildMultitypeInput(target, param, id);
	}else{
		FormBuilder.autoBuildInputElement(target, param, id);
	}
}

FormBuilder.buildMultitypeInput = function(target, param, id) {
	if (typeof id === "undefined" || id===null) id = "";
	  
	if ($.isArray(param.type)) {
		target.append('<div class="panel-heading"><small class="text-muted">Pick a parameter type...</small><span class="badge pull-right">multitype</span></div>');
		for (var key = 0; key < param.type.length; key++) {
			target.append('<div class="panel panel-default clearfix '+id+'-panel" id="'+id+'-type'+key+'-panel"><fieldset class="col-lg-11 '+id+'-type-fieldset" id="'+id+'-type'+key+'-fieldset"></fieldset><button type="button" class="btn btn-primary btn-xs col-lg-1 tryit-type-picker '+id+'-picker" id="'+id+'-type'+key+'-picker">Pick</button></div>');
			FormBuilder.autoBuildInputElement($('#'+id+'-type'+key+'-fieldset'), param.type[key], id+'-type'+key+'-input');
		}
		//Default the selected type to the first on ein the list
		FormBuilder.handleTypePickerClick(id+'-type0-picker');
	}else{
		console.log('Not a multitype parameter');
	}
}

FormBuilder.autoBuildInputElement = function(target, typeDef, id) {
	if (typeof id === "undefined" || id===null) id = "";

	switch (typeDef.type) {
		case "boolean":
			FormBuilder.buildBooleanInput(target, typeDef, id);
			break;
		case "integer":
			FormBuilder.buildIntegerInput(target, typeDef, id);
			break;
		case "array":
			FormBuilder.buildArrayInput(target, typeDef, id);
			break;
		case "string":
			if ($.isArray(typeDef.enums)) {
				FormBuilder.buildEnumInput(target, typeDef, id);
			}else{
				FormBuilder.buildTextInput(target, typeDef, id);
			}
			break;
	}
}

FormBuilder.buildArrayInput = function(target, typeDef, id) {
	if (typeof id === "undefined" || id===null) id = "";
	
	if (typeDef.type=='array') {
		var arrayInput = '';
		arrayInput += '<input type="text" class="form-control" id="'+id+'">';
		target.append(arrayInput);
	}else{
		console.log('Not an array parameter');
	}
}

FormBuilder.buildTextInput = function(target, typeDef, id, placeholder) {
	if (typeof id === "undefined" || id===null) id = "";
	if (typeof placeholder === "undefined" || placeholder===null) placeholder = "";
	
	if (typeDef.type=='string') {
		var textInput = '';
		textInput += '<input type="text" class="form-control" id="'+id+'" placeholder="'+placeholder+'">';
		target.append(textInput);
	}else{
		console.log('Not a string parameter');
	}
}

FormBuilder.buildIntegerInput = function(target, typeDef, id) {
	if (typeof id === "undefined" || id===null) id = "";
	
	if (typeDef.type=='integer') {
		var textInput = '';
		textInput += '<input type="text" class="form-control" id="'+id+'" value="'+(typeDef.maximum != 'undefined' ? typeDef.default : '')+'">';
		target.append(textInput);
		if (typeDef.maximum != 'undefined') {
			if (typeDef.maximum > 0) {
				$('#'+id).slider({
					min: typeDef.minimum,
					max: typeDef.maximum
				});
			}
		}
	}else{
		console.log('Not an integer parameter');
	}
}

FormBuilder.buildEnumInput = function(target, typeDef, id) {
	if (typeof id === "undefined" || id===null) id = "";
	
	if (($.isArray(typeDef.enums)) && (typeDef.type=='string')) {
		var enumInput = '<select class="form-control" id="'+id+'">';
		$.each(typeDef.enums, function(key, value) {
			enumInput += '<option>'+value+'</option>';
		});
		enumInput += '</select>';
		target.append(enumInput);
	}else{
		console.log('Not a string enums parameter');
	}
}

FormBuilder.buildBooleanInput = function(target, typeDef, id) {
	if (typeof id === "undefined" || id===null) id = "";
	
	if (typeDef.type=='boolean') {
		var booleanInput = '';
		//booleanInput += '<div class="make-switch" id="'+id+'-switch"><input type="checkbox" class="myClass" />Boolean</div>';
		//booleanInput += '<input type="radio" class="myClass" value="1" id="'+id+'-switch" name="'+id+'-switch">';
		booleanInput += '<label class="radio-inline"><input class="myClass" type="radio" name="'+id+'-switch" id="'+id+'-switch-true" value="true" checked>True</label><label class="radio-inline"><input class="myClass" type="radio" name="'+id+'-switch" id="'+id+'-switch-false" value="false">False</label>';
		/*booleanInput += ''+
		'<div class="btn-group" data-toggle="buttons">'+
			'<label class="btn btn-success tryit-boolean-toggle active"><input type="radio" name="'+id+'-switch" id="'+id+'-switch-true"> <i class="icon-ok icon-white"></i></label>'+
			'<label class="btn btn-danger tryit-boolean-toggle"><input type="radio" name="'+id+'-switch" id="'+id+'-switch-false"> False</label>'+
		'</div>';*/
		target.append(booleanInput);
		$('input.myClass').prettyCheckable();
		//$('#'+id+'-switch').bootstrapSwitch();
	}else{
		console.log('Not a boolean parameter');
	}
}