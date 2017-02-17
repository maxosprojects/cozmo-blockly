
function cozmoWs() {
	this.doConnect = function(url, binary) {
		this.websocket = new WebSocket(url);
		if (binary) {
			this.websocket.binaryType = 'arraybuffer';
		}
		var that = this;
		this.websocket.onopen = function(evt) {
			that.onOpen.bind(that, evt)()
		};
		this.websocket.onclose = function(evt) {
			that.onClose.bind(that, evt)()
		};
		this.websocket.onmessage = function(evt) {
			that.onMessage.bind(that, evt)()
		};
		this.websocket.onerror = function(evt) {
			that.onError.bind(that, evt)()
		};
	};
	this.onOpen = function(evt) {
		this.writeToLog("connected\n");
	};
	this.onClose = function(evt) {
		this.writeToLog("disconnected\n");
	};
	this.onMessage = function(evt) {
		this.writeToLog("response: " + evt.data + '\n');
	};
	this.onError = function(evt) {
		this.writeToLog('error: ' + evt.data + '\n');
		this.websocket.close();
	};
	this.doSend = function(message) {
		this.writeToLog("sent: " + message + '\n');
		this.websocket.send(message);
	};
	this.writeToLog = function(message) {
		console.log(message);
	};
	this.doDisconnect = function() {
		this.websocket.close();
	}
}
