function Connection(name, ajaxUrl, socketUrl) {
	this.name = name;
	this.ajaxUrl = ajaxUrl;
	this.socketUrl = socketUrl;
	this.conn = null;
}

Connection.prototype.connect = function() {
	if ((this.conn === undefined) || (this.conn === null)) {
		this.conn = new $.JsonRpcClient({ ajaxUrl: this.ajaxUrl, socketUrl: this.socketUrl });
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