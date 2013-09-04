function SchemaHelper() {}

SchemaHelper.init = function(schema) {
	SchemaHelper.schema = schema;
}

SchemaHelper.normalizeTypes = function(parameters) {
	for (var i = 0; i < parameters.length; i++) {
		if (typeof parameters[i].$ref != 'undefined') {
			parameters[i] = $.extend(parameters[i], SchemaHelper.lookupReferenceType(parameters[i].$ref));
			delete parameters[i]['$ref'];
		}
	}
	return this.parameters;
}

SchemaHelper.lookupReferenceType = function(name) {
	//TODO: This needs to step one step lower into type arrays and do lookups there too
	var type = SchemaHelper.schema.types[name];
	if ($.isArray(type)) {
		for (var i = 0; i < type.length; i++) {
			if (typeof type[i].$ref != 'undefined') {
				type[i] = $.extend(type[i], SchemaHelper.lookupReferenceType(type[i].$ref));
				delete type[i]['$ref'];
			}
		}
	}else{
		if (typeof type.$ref != 'undefined') {
			type = $.extend(type, SchemaHelper.lookupReferenceType(type.$ref));
			delete type['$ref'];
		}
	}
	return type;
}

SchemaHelper.getMethodCount = function() {
    var count = 0;
    for(var prop in SchemaHelper.schema.methods) {
        if(SchemaHelper.schema.methods.hasOwnProperty(prop))
            ++count;
    }
    return count;
}