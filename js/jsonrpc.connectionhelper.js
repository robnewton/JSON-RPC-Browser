function ConnectionHelper() {}

ConnectionHelper.init = function() {
	ConnectionHelper.openConnection = null;
	ConnectionHelper.recentConnections = [];
}

ConnectionHelper.addRecentConnection = function(conn) {
	ConnectionHelper.recentConnections.push(conn);
	ConnectionHelper.recentConnections = jQuery.unique(ConnectionHelper.recentConnections);
	Renderer.refreshRecentConnectionList();
}