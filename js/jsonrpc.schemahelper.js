function Schema(raw) {
	this.id = typeof (raw.lease_id) != 'undefined' ? raw.lease_id : 0;
}

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