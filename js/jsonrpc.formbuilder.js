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
		$(topFieldset + ' div.form-group').append('<label class="col-lg-2 control-label tryit-optional-toggle" id="tryit-' + parameter.name + '-label" for="tryit-' + parameter.name + '-type1-input" title="' + (parameter.required ? parameter.name : 'Click here to enable the ' + parameter.name + ' optional parameter.') + '">' + parameter.name + '</label><div class="col-lg-10 panel panel-primary clearfix" id="tryit-' + parameter.name + '-div"><fieldset id="tryit-' + parameter.name + '-fieldset" '+(parameter.required ? '' : 'disabled')+'></fieldset></div>');
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
        FormBuilder.handleFormSubmit();
        return false;
    });

	$("#tryit-form .pillbox-add").off();
	$("#tryit-form .pillbox-add").on('click', function () {
		FormBuilder.handlePillboxAdd(this.id);
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
			return FormBuilder.getPillBoxPills(id);
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
			if ($('#'+dropdown).find('a:contains("'+value+'")').length > 0) {  //KIs this pill allowed
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
	
	if ($.isArray(param.type)) {
		FormBuilder.buildMultitypeInput(target, param, id);
	}else{
		FormBuilder.autoBuildInputElement(target, param, id);
	}
}

FormBuilder.buildMultitypeInput = function(target, param, id) {
	if (typeof id === "undefined" || id===null) id = "";
	  
	if ($.isArray(param.type)) {
		target.append('<div class="panel-heading"><small>Pick a parameter type...</small><span class="badge pull-right">multitype</span></div>');
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

FormBuilder.test = function(sender) {
	console.log(sender.text);
}

FormBuilder.buildArrayInput = function(target, typeDef, id) {
	if (typeof id === "undefined" || id===null) id = "";
	
	if (typeDef.type=='array') {
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
						for (var i = 0; i < typeDef.items.enums.length; i++) {
							arrayInput += '<li><a href="#" onclick="$(\'#'+id+'-input\').val(this.text)">'+typeDef.items.enums[i]+'</a></li>';
						};
						arrayInput += '' +
					'</ul>'+
				'</div>'+
			'</div><br>'+
			'<div class="well fuelux" style="">'+
				'<div id="'+id+'" class="pillbox'+((typeDef.uniqueItems)?' unique':'')+'">'+
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