function SchemaHelper() {}

SchemaHelper.init = function(schema) {
	SchemaHelper.schema = schema;
	SchemaHelper.enrichedSchema = {};
}

SchemaHelper.normalizeTypes = function(parameters) {
	for (var i = 0; i < parameters.length; i++) {
		circularReferences = false;
		traverseObjectTree(1,parameters[i],processObject);
		if (circularReferences) {
			parameters[i]['circularReferences'] = true;
		}
	}
}

function traverseObjectTree(level,o,func) {
	for (var i in o) {
		if (func.apply(this,[level,i,o])) {
			//Reprocess incase of changes to the object
			traverseObjectTree(level,o,func);
		}
		if (typeof(o[i])=="object") {
			level++;
			traverseObjectTree(level,o[i],func);
			level--;
		}
	}
}

function processObject(level,i,o) {
	var processedSomething = false;
	if (i === '$ref') {
		processedSomething = lookupRef(level,i,o);
	}
	if (i === 'extends') {
		processedSomething = lookupExtension(level,i,o);
	}
	if (i === 'type') {
		if (o[i] === 'object') {
			//logIndented(level, "Found object that needs to be traversed for references {'" + i + "' : "+o[i] + "}");
		}
	}
	return processedSomething;
}

function lookupRef(level,i,o) {
	var type = SchemaHelper.schema.types[o[i]];
	if (!hasCircularReferences(type)){
		o = $.extend(o, type);
		delete o[i];
		return true;
	}else{
		return false;
	}
}

function lookupExtension(level,i,o) {
	var extensionType = SchemaHelper.schema.types[o[i]];
	o.type = extensionType.type;
	o.uniqueItems = extensionType.uniqueItems;
	delete o[i];
	return true;
}

var typeName = '';
var circularReferences = false;

function hasCircularReferences(type) {
	typeName = type.id;
	traverseObjectTree(1,type,checkForTypeNameMatch);
	return circularReferences;
}

function checkForTypeNameMatch(level,i,o) {
	if ((!circularReferences) && (i === '$ref')) {
		if (o[i] === typeName) {
			circularReferences = true;
		}
	}
	return false;
}

function logIndented(level, message) {
	var str = '';
	for (var i = 1; i < level; i++) {
		str += '+--';
	};
	console.log(str + message);
}

SchemaHelper.getMethodCount = function() {
	var count = 0;
	for(var prop in SchemaHelper.schema.methods) {
		if(SchemaHelper.schema.methods.hasOwnProperty(prop))
			++count;
	}
	return count;
}