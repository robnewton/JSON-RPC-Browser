function Connection(name, ajaxEndPoint, socketEndPoint, path) {
	this.name = name;
	this.ajaxEndPoint = ajaxEndPoint;
	this.socketEndPoint = socketEndPoint;
	this.path = path;
	this.ajaxUrl = ajaxEndPoint + path;
	this.socketUrl = socketEndPoint + path;
	this.conn = null;
}

Connection.prototype.connect = function() {
	if ((this.conn === undefined) || (this.conn === null)) {
		this.conn = new $.JsonRpcClient({ ajaxUrl: this.ajaxUrl, socketUrl: this.socketUrl, onmessage: this.handleNonResponseError });
		ConnectionHelper.addRecentConnection(this);
	}
}

Connection.prototype.introspect = function(handler) {
	this.conn.call(
	  'JSONRPC.Introspect', [],
	  handler,
	  this.handleError
	);
}

Connection.prototype.call = function(method, params, handler) {
	this.conn.call(
	  method,
	  params,
	  handler,
	  this.handleError
	);
}

Connection.prototype.handleError = function(error) {
	Renderer.showError(
		error.message + " \n" + error.code + "",
		JSON.stringify(error, null, 4)
	);
};

Connection.prototype.handleNonResponseError = function(error) {
	console.log(error);
};