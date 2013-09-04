var methods = new Array();
var currentMethodIndex = 0;
var introspectionResult = null;
var conn = null;

jQuery(document).ready(function ($) {
	$('#tabs').tab();
});
	
conn = new $.JsonRpcClient({ ajaxUrl: '/jsonrpc', socketUrl: 'ws://localhost:9090/jsonrpc' });
conn.call(
  'JSONRPC.Introspect', [],
  handleIntrospectResult,
  handleError
);

function handleError(error) {
	console.log(error.message + " \n" + error.code + "");
	$('#tryit-response').text(JSON.stringify(error, null, 4));
	$('#tryit-response').show();
};

function handleIntrospectResult(result) {
	introspectionResult = result;
	console.log(result);
	//Loop through methods to build list
	
	//<li class="divider"></li>
	//<li class="nav-header">Nav header</li>
	//<li><a href="#">Separated link</a></li>
	var i = 0;
	$.each(result.methods, function(key, value) {
		method = result.methods[key];
		method.name = key;
		method.params = followRefs(method.params);
		methods.push(method);
		$("#methods").append('<a href="javascript:showDetails('+i+')" class="list-group-item">' + key + '</a>\n');
		i++;
	});
	$("#method-count").html(i+1);
	console.log(methods);
	
	//TEST TEST TEST TEST TEST TEST TEST
	/*console.log('Flattening the parameter definitions for ' + methods[2].name + '...');
	console.log(methods[2].params);
	enriched = followRefs(methods[2].params);
	console.log('Updated the type definition for any reference types.');
	console.log(enriched);*/
	//TEST TEST TEST TEST TEST TEST TEST
};

function followRefs(paramsArray) {
	$.each(paramsArray, function(key, paramDef) {
		var refDef = null;
		//Check to see if we have a reference to lookup at all
		if (typeof paramDef.$ref === "string") {
			refDef = getRefType(paramDef.$ref);
			console.log('Reference type '+paramDef.$ref+' found:');
			console.log(refDef);
			paramsArray[key] = $.extend(paramsArray[key], refDef);
			delete paramsArray[key]['$ref'];
		}else{
			//TODO: Process non-referencing parameter types (maybe nothing needs to be done?)
			console.log('Non-referencing type found:');
			console.log(paramDef);
		}
	});
	return paramsArray;
}

function getRefType(name) {
	return introspectionResult.types[name];
}

function handleTryItResult(result) {
	$('#tryit-response').text(JSON.stringify(result, null, 4));
	$('#tryit-response').show();
	console.log(result);
};

function getParamValue(paramDef) {
	var value = $('#tryit-form-'+paramDef.name+'-input').val();
	value = (value == 'true') ? true : value;
	value = (value == 'false') ? false : value;

	var type = getParamType(paramDef);
	if (type.custom) {
		//Get the value of a custom type input
	}else if(type.def == 'string'){
		//Get the value of a string type input
		return $('#tryit-form-'+paramDef.name+'-input').val();
	}
}

$(function() {
    $('#tryit-form').submit(function() {
        //console.log(JSON.stringify($('#tryit-form').serializeObject()));
		var params = {};
		$.each(methods[currentMethodIndex].params, function(key, value) {
			if (value.required == true) {
				if ($('#tryit-form-'+value.name+'-input').val() == 'false') {
					params[value.name] = false;
				}
			}
		});
		conn.call(
		  methods[currentMethodIndex].name,
		  params,
		  handleTryItResult,
		  handleError
		);
        return false;
    });
});

function getParamType(paramDef) {
	var type = {custom : false, def : {}};
	if (typeof paramDef.$ref == "string") {
		type.custom = true;
		type.def = getRefType(paramDef.$ref);
	}else{
		type.custom = false;
		type.def = paramDef.type;
	}
	return type;
}

var tagsToInit = new Array();

function showDetails(method) {
	currentMethodIndex = method;
	console.log(methods[method]);
	$("#params-table").find("tr:gt(0)").remove();
	$("#method-name").html(methods[method].name);
	$("#method-desc").html(methods[method].description);
	$("#schema-json").text(JSON.stringify(methods[method], null, 4));
	
	//Build try it form structure
	$('#tryit-form').find('fieldset').remove();
	$('#tryit-form').find('button').remove();
	$('#tryit-form').append('<fieldset id="tryit-form-required"><legend>Required</legend></fieldset>');
	$('#tryit-form').append('<fieldset id="tryit-form-optional"><legend>Optional</legend></fieldset>');
	$('#tryit-form').append('<button type="submit" class="btn btn-default">Submit</button>');
	
	$.each(methods[method].params, function(key, param) {
		var type = getParamType(param);
		var required = (param.required) ? 'true' : 'false';
		var typeString = (type.custom) ? type.id : type.def;
		$('#params-table > tbody:last').append('<tr><th>'+param.name+'</th><td>'+required+'</td><td>'+typeString+'</td><td>'+param.default+'</td></tr>');
		
		//Add form inputs for each parameter
		var fieldset = (param.required == true ? '#tryit-form-required' : '#tryit-form-optional');
		tagsToInit = new Array();
		$(fieldset).append('<div class="form-group"><label for="tryit-form-'+param.name+'-input">'+param.name+'</label>'+autoBuildInput(param, 'tryit-form-'+param.name+'-input')+'</div>');
		//$.each(tagsToInit, function(key, value) {
			//$('#'+value).tag({caseInsensitive : true, allowDuplicates : false, source : []});
		//	$('#'+value).tag({caseInsensitive : true, allowDuplicates : false, source : ['test']});
		//});
	});
	
	$(".enableOptionalParam:checkbox").on("click", function(){
		console.log('Optional parameter enabled');
		var split = $(this).attr("id").split("-");
		var paramInput = split.slice(0, split.length - 1).join("-") + '-input';
		if ($(this).is(':checked')){
			$('#'+paramInput).prop('disabled', false);
		} else {
			$('#'+paramInput).prop('disabled', true);
		}
	});
}
/*
function buildInputElement(param) {
	var input = '';
	var enableOptionalCheck = '<div class="input-group"><span class="input-group-addon"><input type="checkbox" class="enableOptionalParam" id="tryit-form-'+param.name+'-check"></span>';
	var disabledFlag = param.required ? '' : ' disabled';
	var message = '  Param: '+param.name+' ('+(param.required ? 'required' : 'optional');
	
	//TODO: Branch on the parameter details to generate an appropriate input
	var type = getParamType(param);
	if (type.custom) {
		message += ', '+typeof(type.def.type);
		switch (typeof(type.def.type)) {
			case "array":
				input = buildTextInput(param, disabledFlag);
			case "object":
				input = buildTextInput(param, disabledFlag);
		}
	}else{
		message += ', '+typeof(type.def);
		switch (type.def) {
			case "boolean":
				input = '<input type="checkbox" id="tryit-form-'+param.name+'-input">';
				break;
			case "string":
				input = '<input type="text" class="form-control" id="tryit-form-'+param.name+'-input" placeholder="'+param.default+'"'+disabledFlag+'>';
				break;
			case "string":
				input = buildTextInput(param, disabledFlag);
				break;
		}
	}
	
	console.log(message + ')');
	return param.required ? input : enableOptionalCheck + input + '</div>';
}
*/
var message = "";

function autoBuildInput(param, id) {
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
}

function buildMultitypeInput(param, id) {
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
		$.each(param.type, function(key, parmType) {
			multitypeInput += '<div class="input-group"><span class="input-group-addon"><input type="radio" name="'+id+'"></span>'+ autoBuildInputElement(parmType, id + '-' + key) + '</div><p></p>';
			message += ', '+parmType;
		});
		multitypeInput += '</fieldset>';
	}else{
		console.log('Not a multitype parameter');
	}
	return multitypeInput;
}

function autoBuildInputElement(typeDef, id) {
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
}

function buildArrayInput(typeDef, id) {
	if (typeof id === "undefined" || id===null) id = "";
	
	var arrayInput = '';
	if (typeDef.type=='array') {
		arrayInput += '<input type="text" class="form-control" id="'+id+'">';
		tagsToInit.push(id);
	}
	return arrayInput;
}

function buildTextInput(typeDef, id, placeholder) {
	if (typeof id === "undefined" || id===null) id = "";
	if (typeof placeholder === "undefined" || placeholder===null) placeholder = "";
	
	var textInput = '';
	if (typeDef.type=='string') {
		textInput += '<input type="text" class="form-control" id="'+id+'" placeholder="'+placeholder+'">';
	}
	return textInput;
}

function buildEnumInput(typeDef, id) {
	if (typeof id === "undefined" || id===null) id = "";
	
	var enumInput = '<select class="form-control" id="'+id+'">';
	if (($.isArray(typeDef.enums)) && (typeDef.type=='string')) {
		$.each(typeDef.enums, function(key, value) {
			enumInput += '<option>'+value+'</option>';
		});
		enumInput += '</select>';
	}
	return enumInput;
}

function buildBooleanInput(typeDef, id) {
	if (typeof id === "undefined" || id===null) id = "";
	
	var booleanInput = '';
	if (typeDef=='boolean') {
		booleanInput += '<input type="checkbox" id="'+id+'">';
	}
	return booleanInput;
}

function filter(element,what) {
    var value = $(element).val();
    value = value.toLowerCase().replace(/\b[a-z]/g, function(letter) {
        return letter.toUpperCase();
    });
    if(value == '') {
        $('#'+what+' > a').show();
		$("#method-count").html($('#'+what+' > a').length);
    }else{
        $('#'+what+' > a:not(:contains(' + value + '))').hide();
        $('#'+what+' > a:contains(' + value + ')').show();
		$("#method-count").html($('#'+what+' > a:contains(' + value + ')').length);
    }
};
