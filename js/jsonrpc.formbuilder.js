function FormBuilder(raw) {
	this.id = typeof (raw.lease_id) != 'undefined' ? raw.lease_id : 0;
}

FormBuilder.prototype.autoBuildInput = function(param, id) {
	if (typeof id === "undefined" || id===null) id = "";
	
	message = '  Param: '+param.name+' ('+(param.required ? 'required' : 'optional');
	
	var input = "";
	if ($.isArray(param.type)) {
		message += ', array';
		input += buildMultitypeInput(param, id);
	}else{
		input += autoBuildInputElement(param, id);
	}
	
	console.log(message + ')');
	return input;
};

FormBuilder.prototype.buildMultitypeInput = function(param, id) {
	if (typeof id === "undefined" || id===null) id = "";
	
	//Expects an enriched parameter definition (any references looked up)
	//For each type allowed for the parameter (only used when multiple are
	//	supported) an input element is generated. Each will have radio button
	//	to allow the user to indicate which of the types he/she wishes to use.
	//All inputs will be grouped into one radio button group and be wrapped
	//	with a single fieldset to allow for the set to enabled/disabled all
	//	at once if need be.
	  
	var multitypeInput = '';
	if ($.isArray(param.type)) {
		multitypeInput += '<fieldset id="'+id+'">';
		$.each(param.type, FormBuilder.prototype.(key, parmType) {
			multitypeInput += '<div class="input-group"><span class="input-group-addon"><input type="radio" name="'+id+'"></span>'+ autoBuildInputElement(parmType, id + '-' + key) + '</div><p></p>';
			message += ', '+parmType;
		});
		multitypeInput += '</fieldset>';
	}else{
		console.log('Not a multitype parameter');
	}
	return multitypeInput;
};

FormBuilder.prototype.autoBuildInputElement = function(typeDef, id) {
	if (typeof id === "undefined" || id===null) id = "";
	message += ', '+typeDef.type;
	var input = "";
	switch (typeDef.type) {
		case "boolean":
			input += buildBooleanInput(typeDef);
			break;
		case "array":
			input += buildArrayInput(typeDef, id);
			break;
		case "string":
			if ($.isArray(typeDef.enums)) {
				input += buildEnumInput(typeDef);
			}else{
				input += buildTextInput(typeDef);
			}
			break;
	}
	return input;
};

FormBuilder.prototype.buildArrayInput = function(typeDef, id) {
	if (typeof id === "undefined" || id===null) id = "";
	
	var arrayInput = '';
	if (typeDef.type=='array') {
		arrayInput += '<input type="text" class="form-control" id="'+id+'">';
		tagsToInit.push(id);
	}
	return arrayInput;
};

FormBuilder.prototype.buildTextInput = function(typeDef, id, placeholder) {
	if (typeof id === "undefined" || id===null) id = "";
	if (typeof placeholder === "undefined" || placeholder===null) placeholder = "";
	
	var textInput = '';
	if (typeDef.type=='string') {
		textInput += '<input type="text" class="form-control" id="'+id+'" placeholder="'+placeholder+'">';
	}
	return textInput;
};

FormBuilder.prototype.buildEnumInput = function(typeDef, id) {
	if (typeof id === "undefined" || id===null) id = "";
	
	var enumInput = '<select class="form-control" id="'+id+'">';
	if (($.isArray(typeDef.enums)) && (typeDef.type=='string')) {
		$.each(typeDef.enums, FormBuilder.prototype.(key, value) {
			enumInput += '<option>'+value+'</option>';
		});
		enumInput += '</select>';
	}
	return enumInput;
};

FormBuilder.prototype.buildBooleanInput = function(typeDef, id) {
	if (typeof id === "undefined" || id===null) id = "";
	
	var booleanInput = '';
	if (typeDef=='boolean') {
		booleanInput += '<input type="checkbox" id="'+id+'">';
	}
	return booleanInput;
};