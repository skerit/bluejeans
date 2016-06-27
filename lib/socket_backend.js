var BluetoothHciSocket = require('bluetooth-hci-socket'),
    Namespace,
    FLAGS = require('./hci_flags'),
    DEFS = require('./hci_definitions'),
    Blast = __Protoblast,
    Obj = Blast.Bound.Object,
    Fn = Blast.Bound.Function,
    Nr = Blast.Bound.Number;

// Get the Bluejeans namespace
Namespace = Fn.getNamespace('Develry.Bluejeans');

/**
 * The Socket Bluejeans Backend Class
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Bluejeans}   bluejeans   The parent instance
 * @param    {Object}      options
 */
var Socket = Fn.inherits('Develry.Bluejeans.Backend', function SocketBackend(bluejeans, options) {

	// Call the parent constructor
	SocketBackend.super.call(this, bluejeans, options);

	// Create the actual bluetooth socket
	this.socket = new BluetoothHciSocket();

	// Is the socket powered up?
	this.socket_is_up = false;

	// Has this been destroyed?
	this.is_destroyed = false;

	// Keep command callbacks in here
	this._command_callbacks = {};

	// Keep connection callbacks in here
	this._connection_callbacks = {};

	// Keep track of discoveries
	this._discoveries = {};

	// Storage for incomplete packets
	this._handle_buffers = {};

	// Sent acl packets
	this._acl_callbacks = {};

	// Initialize the socket
	this.init();
});

/**
 * Expose the definitions
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @type {Object}
 */
Socket.setProperty('DEFS', DEFS);

/**
 * Default backend options
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @type {Object}
 */
Socket.setProperty('default_options', {
	device_id : 0
});

/**
 * Default LE connection options
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @type {Object}
 */
Socket.setProperty('default_le_connection_options', {

	// 60 msec
	scan_interval       : 0x0060,

	// 30 msec
	scan_window         : 0x0030,

	// Initiator filter policy: Use peer address
	filter_policy       : 0x00,

	// Peer address type: public
	peer_address_type   : 0x00,

	// Own address type: public
	own_address_type    : 0x00,

	// Connection interval minimum: 30 msec
	interval_min        : 0x0018,

	// Connection interval maximum: 50 msec
	interval_max        : 0x0028,

	// Connection latency: number of events
	latency             : 0x0000,

	// Connection timeout
	timeout             : 0x02bc,

	// Minimum CE length: 0 msec
	ce_length_min       : 0x0000,

	// Maximum CE length: 0 msec
	ce_length_max       : 0x0000
});


/**
 * Initialize the socket
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function init() {

	var that = this,
	    timer_id;

	// Don't init twice
	if (this._inited) {
		return;
	}

	this._inited = true;

	if (Blast.DEBUG) {
		Namespace.log('Binding socket to', this.options.device_id);
	}

	// Bind to the correct device
	this.socket.bindRaw(this.options.device_id);

	// Start the socket
	this.socket.start();

	// Poll the socket every second to see if it's still on
	timer_id = setInterval(function checkDevice() {

		var is_up;

		// If this instance has been destroyed since
		// the last interval, clear out the timer
		if (that.is_destroyed) {
			return clearInterval(timer_id);
		}

		// See if the socket is up
		is_up = that.socket.isDevUp();

		// If there is no difference in the state, do nothing
		if (is_up === that.socket_is_up) {
			return;
		}

		// Remember the last seen state
		that.socket_is_up = is_up;

		if (Blast.DEBUG) {
			Namespace.log('Socket state has changed:', is_up ? 'Activated': 'Deactivated');
		}

		if (is_up) {
			that._activated();
		} else {
			that._deactivated();
		}
	}, 1000);

	// Listen for incoming data
	this.socket.on('data', function onData(data) {
		return that._onSocketData(data);
	});

	// Listen for socket errors
	this.socket.on('error', function onError(err) {
		console.log('Got socket error:', err);
		throw err;
	});
});

/**
 * Set the socket filter
 * No response is received from the socket for this
 *
 * @author   Sandeep Mistry <sandeep.mistry@gmail.com>
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function setSocketFilter() {

	var event_mask_1,
	    event_mask_2,
	    type_mask,
	    opcode,
	    filter;

	// Create the filter buffer
	filter = new Buffer(14);

	// Generate the masks
	type_mask = (1 << DEFS.TYPE.COMMAND) | (1 << DEFS.TYPE.EVENT) | (1 << DEFS.TYPE.ACL_DATA);

	event_mask_1 = (1 << DEFS.EVENT.DISCONNECTION_COMP) | (1 << DEFS.EVENT.ENCRYPTION_CHANGE) | (1 << DEFS.EVENT.COMMAND_COMPLETE) | (1 << DEFS.EVENT.COMMAND_STATUS);
	event_mask_2 = (1 << (DEFS.EVENT.BLE_EVENT - 32));
	opcode = 0;

	// Now fill the filter buffer
	filter.writeUInt32LE(type_mask, 0);
	filter.writeUInt32LE(event_mask_1, 4);
	filter.writeUInt32LE(event_mask_2, 8);
	filter.writeUInt16LE(opcode, 12);

	if (Blast.DEBUG) {
		Namespace.log('Setting socket filter:', filter);
	}

	// Set the actual filter on the socket
	this.socket.setFilter(filter);
});

/**
 * Send a command to the socket as soon as it's ready
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}   sub_type
 * @param    {Buffer}   payload
 * @param    {Function} callback
 */
Socket.setMethod(function sendCommand(sub_type, payload, callback) {

	var that = this;

	// Wait for the device to be ready
	this.afterOnce('ready', function onReady() {
		that._sendCommand(sub_type, payload, callback);
	});
});

/**
 * Actually send a command to the socket
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}   sub_type
 * @param    {Buffer}   payload
 * @param    {Function} callback
 */
Socket.setMethod(function _sendCommand(sub_type, payload, callback) {

	var full_length = 4,
	    length = 0,
	    cmd,
	    i;

	if (typeof payload == 'function') {
		callback = payload;
		payload = null;
	} else if (payload) {
		length = payload.length;
		full_length += length;
	}

	// Create the command buffer
	cmd = new Buffer(full_length);

	// Set the headers,
	// start with the COMMAND flag
	cmd.writeUInt8(DEFS.TYPE.COMMAND, 0);

	// Now set the sub type
	cmd.writeUInt16LE(sub_type, 1);

	// And set the actual payload length
	cmd.writeUInt8(length, 3);

	// If there is a payload, copy it into the command buffer
	if (length) {

		if (Array.isArray(payload)) {
			for (i = 0; i < payload.length; i++) {
				cmd[4 + i] = payload[i];
			}
		} else {
			payload.copy(cmd, 4);
		}
	}

	if (Blast.DEBUG) {
		Namespace.log('Sending sub_type', DEFS.identify(sub_type), 'command:', cmd);
	}

	// Register the callback if it isn't explicitly false
	if (callback !== false) {
		// Make sure the entry for this type of command exists
		if (this._command_callbacks[sub_type] == null) {
			this._command_callbacks[sub_type] = [];
		}

		// Add the callback to the list (even if it's null)
		this._command_callbacks[sub_type].push(callback);
	}

	// Actually send the command buffer to the socket
	this.socket.write(cmd);
});

/**
 * Send Acl Data packet
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}   handle
 * @param    {Number}   cid
 * @param    {Buffer}   payload
 * @param    {Function} callback
 */
Socket.setMethod(function sendAclData(handle, cid, payload, callback) {

	var full_length = 9,
	    length = 0,
	    packet,
	    i;

	if (typeof payload == 'function') {
		callback = payload;
		payload = null;
	} else if (payload) {
		length = payload.length;
		full_length += length;
	}

	// Create the packet buffer
	packet = new Buffer(full_length);

	// Set the type
	packet.writeUInt8(DEFS.TYPE.ACL_DATA, 0);

	// Set the handle (ACL_START_NO_FLUSH)
	packet.writeUInt16LE(handle | 0x00 << 12, 1);

	// Set the payload lengths
	packet.writeUInt16LE(length + 4, 3);
	packet.writeUInt16LE(length, 5);

	// Write the CID
	packet.writeUInt16LE(cid, 7);

	// Copy in the payload
	if (length) {

		if (Array.isArray(payload)) {
			for (i = 0; i < payload.length; i++) {
				packet[9 + i] = payload[i];
			}
		} else {
			payload.copy(packet, 9);
		}
	}

	if (Blast.DEBUG) {
		Namespace.log('Sending ACL cid', DEFS.identify(cid), 'packet:', packet);
	}

	// Register the callback if it isn't explicitly false
	if (callback !== false) {
		// Make sure the entry for this type of command exists
		if (this._acl_callbacks[cid] == null) {
			this._acl_callbacks[cid] = [];
		}

		// Add the callback to the list (even if it's null)
		this._acl_callbacks[cid].push(callback);
	}

	this.socket.write(packet);
});

/**
 * Set the socket event mask
 *
 * @author   Sandeep Mistry <sandeep.mistry@gmail.com>
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function setEventMask(callback) {
	this._sendCommand(DEFS.GRP.HOST.BASE.SET_EVENT_MASK, new Buffer('fffffbff07f8bf3d', 'hex'), callback);
});

/**
 * Set the socket low-energy event mask
 *
 * @author   Sandeep Mistry <sandeep.mistry@gmail.com>
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function setLeEventMask(callback) {
	this._sendCommand(DEFS.BLE.SET_EVENT_MASK, new Buffer('1f00000000000000', 'hex'), callback);
});

/**
 * Read the local version
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function readLocalVersion(callback) {
	this._sendCommand(DEFS.GRP.INFO.READ_LOCAL_VERSION_INFO, null, callback);
});

/**
 * Read the local device address
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function readLocalAddress(callback) {
	this._sendCommand(DEFS.GRP.INFO.READ_BD_ADDR, null, callback);
});

/**
 * Write le host supported command
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function writeLeHostSupported(callback) {
	this._sendCommand(DEFS.GRP.HOST.BASE.WRITE_LE_HOST_SUPPORTED, Buffer('0100', 'hex'), callback);
});

/**
 * Read le host supported command
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function readLeHostSupported(callback) {
	this._sendCommand(DEFS.GRP.HOST.BASE.READ_LE_HOST_SUPPORTED, null, callback);
});

/**
 * Get the LE remote used features
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}   handle
 */
Socket.setMethod(function readLeRemoteUsedFeatures(handle, callback) {

	var buf = new Buffer(2);

	buf.writeUInt16LE(handle, 0);

	this._sendCommand(DEFS.BLE.READ_REMOTE_FEATURES, buf, callback);
});

/**
 * Get general scan status, callback with true or false
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function getScanStatus(callback) {

	var that = this;

	this.sendCommand(DEFS.GRP.HOST.BASE.READ_SCAN_ENABLE, function gotScanStatus(err, result) {

		if (err) {
			return callback(err);
		}

		callback(null, !!result[0]);
	});
});

/**
 * Set the scan status.
 * 0x00 = disabled
 * 0x01 = inquiry scan
 * 0x02 = page scan
 * 0x03 = both
 * true = 0x03
 * false = 0x00
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Boolean|Number}   status
 * @param    {Function}         callback
 */
Socket.setMethod(function setScanStatus(status, callback) {

	var val;

	if (status === true) {
		val = 0x03;
	} else if (status === false) {
		val = 0x00;
	} else {
		val = status;
	}

	this.sendCommand(DEFS.GRP.HOST.BASE.WRITE_SCAN_ENABLE, [val], callback);
});

/**
 * Set LE scan enabled
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function setLeScanStatus(enabled, callback) {
	// Set the scan status once ready
	this._setLeScanStatus(enabled, true, callback);
});

/**
 * Set LE scan enabled
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function _setLeScanStatus(enabled, wait_for_ready, callback) {

	var that = this,
	    payload;

	if (typeof wait_for_ready == 'function') {
		callback = wait_for_ready;
		wait_for_ready = false;
	}

	payload = new Buffer(2);

	// Enable or disable the scanning
	payload.writeUInt8(enabled ? 0x01 : 0x00, 0);

	// Don't filter duplicates
	payload.writeUInt8(0x00, 1);

	Namespace.log('Setting scan status:', enabled);

	// Send the command
	if (wait_for_ready) {
		this.sendCommand(DEFS.BLE.WRITE_SCAN_ENABLE, payload, callback);
	} else {
		// Send immediately
		this._sendCommand(DEFS.BLE.WRITE_SCAN_ENABLE, payload, callback);
	}
});

/**
 * Disconnect a handle
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}   handle
 * @param    {Number}   reason
 * @param    {Function} callback
 */
Socket.setMethod(function disconnectHandle(handle, reason, callback) {

	var payload;

	if (typeof reason == 'function' || reason == null) {
		// User disconnected?
		reason = DEFS.ERROR.PEER_USER;
	}

	payload = new Buffer(3);

	// Set the handle we want to disconnect
	payload.writeUInt16LE(handle, 0);

	// Give the reason for the disconnect
	payload.writeUInt8(reason, 2);

	// Send the command
	this.sendCommand(DEFS.GRP.LINK.CONTROL.DISCONNECT, payload, callback);
});

/**
 * Set LE scan parameters
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function setLeScanParameters(callback) {

	var payload = new Buffer(7);

	// 0 for passive, 1 for active
	payload.writeUInt8(0x01, 0);

	payload.writeUInt16LE(0x0010, 1); // internal, ms * 1.6
	payload.writeUInt16LE(0x0010, 3); // window, ms * 1.6
	payload.writeUInt8(0x00, 5); // own address type: 0 -> public, 1 -> random
	payload.writeUInt8(0x00, 6); // filter: 0 -> all event types

	// Send the command
	this.sendCommand(DEFS.BLE.WRITE_SCAN_PARAMS, payload, callback);
});

/**
 * Read the RSSI for a certain handle
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}   handle
 * @param    {Function} callback
 */
Socket.setMethod(function readRssi(handle, callback) {

	var payload = new Buffer(2);

	// Write in the handle
	payload.writeUInt16LE(handle, 0);

	this.sendCommand(FLAGS.READ_RSSI_CMD, payload, callback);
});

/**
 * Scan for devices
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function _leScan(callback) {

	var that = this;

	// Wait for the socket to be ready
	this.afterOnce('ready', function afterReady() {

		if (Blast.DEBUG) {
			Namespace.log('Starting LE scan');
		}

		Fn.parallel(function setParameters(next) {
			that.setLeScanParameters(next);
		}, function enableScan(next) {
			that.setLeScanStatus(true, next);
		}, function done(err) {

			if (err) {
				return callback(err);
			}

			if (Blast.DEBUG) {
				Namespace.log('Scan has started');
			}

		});
	});
});

/**
 * Receive incoming socket data,
 * forward it to the correct data handlers
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function _onSocketData(data) {

	var event_type,
	    handle,
	    status,
	    cmd;

	// Get the event type
	event_type = data.readUInt8(0);

	Namespace.log('Got packet:', data);

	switch (event_type) {

		case DEFS.TYPE.COMMAND:
			this._handleCommandPacket(data);
			break;

		case DEFS.TYPE.ACL_DATA:
			this._handleAclDataPacket(data);
			break;

		case DEFS.TYPE.SCO_DATA:
			Namespace.log('Received SCO_DATA', data);
			break;

		case DEFS.TYPE.EVENT:
			this._handleEventPacket(data);
			break;

		case DEFS.TYPE.LM_DIAG:
			Namespace.log('Received LM_DIAG', data);
			break;

		case DEFS.TYPE.NFC:
			Namespace.log('Received NFC', data);
			break;

		default:
			if (Blast.DEBUG) {
				Namespace.log('Ignoring data of unknown type:', data);
			}
	}
});

/**
 * Handle incoming command packets
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function _handleCommandPacket(data) {

	var command_type,
	    command,
	    chunk;

	// Get the command
	command = data.readUInt16LE(1);

	// Get the command type
	// Shift it 10 to the right, and then back 10 to the left
	// That tells us what type it is, according to the nrs in DEFS.GRP
	command_type = command >> 10 << 10;

	// Get the chunk rest
	chunk = data.slice(3);

	if (Blast.DEBUG) {
		Namespace.log('Received COMMAND of type', DEFS.GRP.identify(command_type), DEFS.identify(command), data);
	}

	switch (command_type) {

		case DEFS.GRP.LINK_CONTROL_CMDS:
			break;

		case DEFS.GRP.LINK_POLICY_CMDS:
			break;

		case DEFS.GRP.HOST_CONT_BASEBAND_CMDS:
			break;

		case DEFS.GRP.INFORMATIONAL_PARAMS:
			break;

		case DEFS.GRP.STATUS_PARAMS:
			break;

		case DEFS.GRP.TESTING_CMDS:
			break;

		case DEFS.GRP.BLE_CMDS:
			this._handleBleCommandPacket(command, chunk);
			break;

		case DEFS.GRP.VENDOR_SPECIFIC:
			break;
	}
});

/**
 * Handle incoming BLE command packets
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}   command
 * @param    {Buffer}   chunk
 */
Socket.setMethod(function _handleBleCommandPacket(command, chunk) {

	if (Blast.DEBUG) {
		Namespace.log('Received BLE command', DEFS.BLE.identify(command), chunk);
	}

});

/**
 * Handle incoming event packets
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function _handleEventPacket(data) {

	var sub_type;

	// Get the sub type
	sub_type = data.readUInt8(1);

	switch (sub_type) {

		case DEFS.EVENT.DISCONNECTION_COMP:
			this._processDisconnectCompleteEvent(data);
			break;

		case DEFS.EVENT.ENCRYPTION_CHANGE:
			Namespace.log('Encrypt change');
			break;

		case DEFS.EVENT.COMMAND_COMPLETE:
			this._processCmdCompleteEvent(data);
			break;

		case DEFS.EVENT.COMMAND_STATUS:
			this._processCmdStatusEvent(data);
			break;

		case DEFS.EVENT.BLE_EVENT:
			this._handleLeMetaEvent(data);
			break;
	}
});

/**
 * Process a disconnect event
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Buffer}   data
 */
Socket.setMethod(function _processDisconnectCompleteEvent(data) {

	var handle = data.readUInt16LE(4),
	    reason = data.readUInt8(6);

	this.registerDeviceDisconnect(handle, reason);
});

/**
 * Get a command callback, or a thrower if it doesn't exist
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}   cmd
 * @param    {Boolean}  throw_if_no_cb
 *
 * @return   {Function}
 */
Socket.setMethod(function _getCommandCallback(cmd, throw_if_no_cb) {

	var original_cb,
	    cb;

	if (this._command_callbacks[cmd]) {
		original_cb = this._command_callbacks[cmd].shift();
	}

	if (!original_cb) {
		if (Blast.DEBUG) {
			Namespace.log('No listeners found for', DEFS.identify(cmd));
		}

		if (throw_if_no_cb) {
			original_cb = Fn.thrower;
		} else {
			original_cb = function warn(err) {

				if (err && Blast.DEBUG) {
					Namespace.log('[WARNING]', err);
				}

			};
		}
	}

	// Create a new callback that'll handle error numbers
	cb = function callback_with_error(err) {

		var err_obj;

		if (typeof err == 'number') {

			// Create a new error
			err_obj = new Error('Can\'t execute ' + DEFS.identify(cmd) + ': ' + DEFS.ERROR.identify(err));

			// Add the code
			err_obj.code = err;
		} else if (err) {
			err_obj = err;
		}

		if (err_obj) {
			return original_cb(err_obj);
		}

		original_cb.apply(null, arguments);
	};

	return cb;
});

/**
 * Process "Command Complete" event
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Buffer}   data
 */
Socket.setMethod(function _processCmdCompleteEvent(data) {

	var sub_type = data.readUInt16LE(4),
	    status = data.readUInt8(6),
	    result = {},
	    chunk = data.slice(7),
	    cb;

	if (Blast.DEBUG) {
		Namespace.log('Received COMPLETE event for sub_type', DEFS.identify(sub_type), 'Status:', DEFS.ERROR.identify(status));
	}

	cb = this._getCommandCallback(sub_type);

	// Look for errors
	if (status > 0) {
		return cb(status);
	}

	// Set the result status
	result.status = status;

	switch (sub_type) {

		case FLAGS.READ_LE_HOST_SUPPORTED_CMD:
			if (status === 0) {
				result.le = chunk.readUInt8(0);
				result.simul = chunk.readUInt8(1);
			}
			break;

		case FLAGS.READ_LOCAL_VERSION_CMD:
			result.hci_version = chunk.readUInt8(0);
			result.hci_revision = chunk.readUInt16LE(1);

			// Link manager protocol version
			result.lmp_version = chunk.readInt8(3);

			// The manufacturer id
			result.manufacturer = chunk.readUInt16LE(4);

			// Link manager protocol sub version
			result.lmp_sub_version = chunk.readUInt16LE(6);

			// @TODO
			// if (hciVer < 0x06) {
			// 	this.emit('stateChange', 'unsupported');
			// } else if (this._state !== 'poweredOn') {
			// 	this.setScanEnabled(false, true);
			// 	this.setScanParameters();
			// }
			break;

		// Bluetooth device address command response
		case FLAGS.READ_BD_ADDR_CMD:
			result.address_type = 'public';
			result.address = this.bufToAddress(chunk);
			break;

		case FLAGS.LE_SET_SCAN_PARAMETERS_CMD:
			Namespace.log('Set scan parameters complete!');
			break;

		case FLAGS.READ_RSSI_CMD:
			result.handle = chunk.readUInt16LE(0);
			result.rssi = chunk.readInt8(2);
			break;

		default:
			if (Blast.DEBUG && chunk.length) {
				Namespace.log('Unhandled sub type with response:', DEFS.identify(sub_type), chunk);
				result.chunk = chunk;
			}
	}

	if (cb) {
		cb(null, result);
	}
});

/**
 * Handle Low-enegery Meta event
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Buffer}   data
 */
Socket.setMethod(function _handleLeMetaEvent(data) {

	var sub_type = data.readUInt8(3),
	    status = data.readUInt8(4),
	    chunk = data.slice(5);

	Namespace.log('LE META EVENT:', DEFS.BLE.EVENT.identify(sub_type), status, chunk);

	switch (sub_type) {

		case FLAGS.EVT_LE_CONN_COMPLETE:
			this._processLeConnectionComplete(status, chunk);
			break;

		case FLAGS.EVT_LE_ADVERTISING_REPORT:
			this._processLeAdvertisingReport(status, chunk);
			break;

		case FLAGS.EVT_LE_CONN_UPDATE_COMPLETE:
			this._processLeConnectionUpdate(status, chunk);
			break;

		case DEFS.BLE.EVENT.READ_REMOTE_FEAT_CMPL_EVT:
			this._processLeRemoteFeatures(status, chunk);
			break;

		default:
			if (Blast.DEBUG) {
				Namespace.log(' -- Unknown LE meta event:', DEFS.BLE.EVENT.identify(sub_type, true));
			}
	}
});

/**
 * Process LE Remote Features received from a device
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}   status
 * @param    {Buffer}   chunk
 */
Socket.setMethod(function _processLeRemoteFeatures(status, chunk) {

	var flags = chunk.readUInt16LE(2),
	    result,
	    cb;

	result = {

		// Does it support LE encryption?
		encryption                 : Nr.bitAt(flags, 0) == 1,

		// Does it support the Connection Parameters Request Procedure?
		cprc                       : Nr.bitAt(flags, 1) == 1,

		// Does it support Extended Reject Indication?
		extended_reject_indication : Nr.bitAt(flags, 2) == 1,

		// Does it support slave-initiated features exchange?
		features_exchange          : Nr.bitAt(flags, 3) == 1,

		// Does it support ping?
		ping                       : Nr.bitAt(flags, 4) == 1,

		// Does it support data packet length extension?
		packet_length_extension    : Nr.bitAt(flags, 5) == 1,

		// Does it support privacy?
		privacy                    : Nr.bitAt(flags, 6) == 1,

		// Does it support Extended Scanner Filter Policies?
		extended_filter_policies   : Nr.bitAt(flags, 7) == 1
	};

	cb = this._getCommandCallback(DEFS.BLE.READ_REMOTE_FEATURES);

	if (cb) {
		cb(null, result);
	}
});

/**
 * Process LE Advertising report
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}   status
 * @param    {Buffer}   chunk
 */
Socket.setMethod(function _processLeAdvertisingReport(status, chunk) {

	var address,
	    result;

	// Get the address first
	address = this.bufToAddress(chunk.slice(2, 8));

	// Get the previously discovered result
	result = this._discoveries[address];

	if (!result) {
		result = {
			// Get the type
			type              : chunk.readUInt8(0),

			// Get the type of address
			address_type     : chunk.readUInt8(1) === 0x01 ? 'random' : 'public',

			// Get the address itself
			address           : this.bufToAddress(chunk.slice(2, 8)),

			// How many times this has been seen
			discovery_count   : 0,

			// Scan response
			has_scan_response : false,

			// Is it connectable?
			connectable       : false
		};

		if (result.type !== 0x03) {
			result.connectable = true;
		}

		this._discoveries[address] = result;
	}

	// If the type is 0x04, it has a scan response
	if (result.type === 0x04) {
		result.has_scan_response = true;
	}

	// Increment the discovery count
	result.discovery_count++;

	// Set the status
	result.status = status;

	// Get the extended inquiry response
	result.eir = this.processEir(chunk.slice(9, chunk.length - 1), result.eir);

	// The time it was last discovered
	result.last_seen = Date.now();

	// Get the RSSI
	result.rssi = chunk.readInt8(chunk.length - 1);

	// Process the discovery
	this.processDiscovery(result);
});

/**
 * Handle incoming ACL DATA packets
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Buffer}   data
 */
Socket.setMethod(function _handleAclDataPacket(data) {

	var handle,
	    flags;

	// Get the flags of the packet
	flags = data.readUInt16LE(1) >> 12;

	// Get the handle
	handle = data.readUInt16LE(1) & 0x0fff;

	switch (flags) {

		// ACL Start
		case DEFS.LLID.START:
			this._processAclStart(handle, data);
			break;

		// ACL Continue
		case DEFS.LLID.CONTINUE:
			this._processAclContinuation(handle, data);
			break;
	}
});

/**
 * Process incoming ACL start packets
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}   handle
 * @param    {Buffer}   data
 */
Socket.setMethod(function _processAclStart(handle, data) {

	var length,
	    chunk,
	    cid;

	// Get the length of the payload
	length = data.readUInt16LE(5);

	// Get the cid
	cid = data.readUInt16LE(7);

	// Get the payload itself
	chunk = data.slice(9);

	if (Blast.DEBUG) {
		Namespace.log('Received ACL START', cid, 'of length', length);
	}

	// If the payload length is the same as the expected length,
	// then this chunk is complete
	if (chunk.length === length) {
		return this._finalizeAclDataPacket(handle, cid, chunk);
	}

	// It's not complete yet, so store it for later
	this._handle_buffers[handle] = {
		length : length,
		data   : data,
		cid    : cid
	};
});

/**
 * Process incoming ACL continuation packets
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}   handle
 * @param    {Buffer}   data
 */
Socket.setMethod(function _processAclContinuation(handle, data) {

	var packet = this._handle_buffers[handle];

	if (!packet) {

		if (Blast.DEBUG) {
			Namespace.log('Received continuation for', handle, 'but no start packet!');
		}

		return;
	}

	// Add the newly received data
	packet.data = Buffer.concat([packet.data, data.slice(5)]);

	// If the length is now complete, finalize the packet
	if (packet.data.length === packet.length) {

		// Delete this from the buffer object
		delete this._handle_buffers[handle];

		// And finalize it
		this._finalizeAclDataPacket(handle, packet.cid, packet.data);
	}
});

/**
 * Finalize incoming ACL packets
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}   handle
 * @param    {Number}   cid
 * @param    {Buffer}   data
 */
Socket.setMethod(function _finalizeAclDataPacket(handle, cid, data) {

	var connection;

	// Get the connection
	connection = this.getConnection(handle);

	// Push the data onwards
	connection.gatt.push(cid, data);
});

/**
 * The "Command Status Event" is used to indicate that the command described by
 * the Command_Opcode parameter has been received, and that the Controller
 * is currently performing the task for this command.
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Buffer}   data
 */
Socket.setMethod(function _processCmdStatusEvent(data) {

	var status,
	    cmd,
	    cb;

	status = data.readUInt8(3);

	// Opcode of the command which caused this event and is pending completion
	cmd = data.readUInt16LE(5);

	// Check the status
	if (status == 0) {
		if (Blast.DEBUG) {
			Namespace.log('Command', DEFS.identify(cmd), 'is being executed');
		}

		return;
	}

	Namespace.log('CMD STATUS:', DEFS.ERROR.identify(status));

	// Status was not 0, possible error!
	this._getCommandCallback(cmd)(status);
});

/**
 * Create a Link Layer connection to a connectable advertiser.
 *
 * @author   Sandeep Mistry <sandeep.mistry@gmail.com>
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   address
 * @param    {Object}   options
 * @param    {Function} callback
 */
Socket.setMethod(function _createLeConnection(address, options, callback) {

	var that = this,
	    payload = new Buffer(25);

	if (typeof options == 'function') {
		callback = options;
		options = null;
	}

	if (typeof callback !== 'function') {
		callback = Fn.thrower;
	}

	// Apply default values to the options
	options = Obj.assign({}, this.default_le_connection_options, options);

	// Set the scan interval in msec
	payload.writeUInt16LE(options.scan_interval, 0);

	// Set the scan window in msec
	payload.writeUInt16LE(options.scan_window, 2);

	// Set the initiator filter
	// 0 = Do not use whitelist, 1 = use whitelist
	// (Wireshark reports this as "Use peer address")
	payload.writeUInt8(options.filter_policy, 4);

	// Set the peer address type
	payload.writeUInt8(options.peer_address_type, 5);

	// Add the peer address to the payload
	(new Buffer(address.split(':').reverse().join(''), 'hex')).copy(payload, 6);

	// Add the local address type (Public)
	payload.writeUInt8(options.own_address_type, 12);

	// Set the min connection interval in msec
	payload.writeUInt16LE(options.interval_min, 13);

	// Set the max connection interval in msec
	payload.writeUInt16LE(options.interval_max, 15);

	// Set the latency to 0 number of events
	payload.writeUInt16LE(options.latency, 17);

	// Set the supervision timeout,
	// if no packets are received within this time,
	// the connection is terminated
	payload.writeUInt16LE(options.timeout, 19);

	// Set the min ce length
	payload.writeUInt16LE(options.ce_length_min, 21);

	// Set the max ce length
	payload.writeUInt16LE(options.ce_length_max, 23);

	// Send the command when ready
	that.sendCommand(DEFS.BLE.CREATE_CONN, payload, function createdConnection(err, status) {

		if (err && err.code !== DEFS.ERROR.CONNECTION_EXISTS) {
			return callback(err);
		}

		if (err && err.code === DEFS.ERROR.CONNECTION_EXISTS) {
			Namespace.log('WARNING: Connection already created, how to get handle?');
		}

		// Already connected?
		that.registerDeviceConnectionByAddress(address);

		return callback(null, status);
	});
});

/**
 * Cancel the "Create LE Connection" currently in progress
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function} callback
 */
Socket.setMethod(function cancelCreateLEConnection(callback) {
	this._sendCommand(DEFS.BLE.CREATE_CONN_CANCEL, null, callback);
});

/**
 * Process completed Low-energy connection
 *
 * @author   Sandeep Mistry <sandeep.mistry@gmail.com>
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}   status
 * @param    {Buffer}   chunk
 */
Socket.setMethod(function _processLeConnectionComplete(status, chunk) {

	var result,
	    cb;

	// Construct the result object
	result = {
		handle                : chunk.readUInt16LE(0),
		role                  : chunk.readUInt8(2),
		address_type          : chunk.readUInt8(3) === 0x00 ? 'public' : 'random',
		address               : this.bufToAddress(chunk.slice(4, 10)),
		interval              : chunk.readUInt16LE(10) * 1.25,
		latency               : chunk.readUInt16LE(12),
		supervision_timeout   : chunk.readUInt16LE(14) * 10,
		master_clock_accuracy : chunk.readUInt8(16)
	};

	// Get the callback that was supplied when creating the connection
	cb = this._getCommandCallback(DEFS.BLE.CREATE_CONN);

	if (status === 0) {
		this._finalizeLeConnectionComplete(result, cb);
	} else {
		if (Blast.DEBUG) {
			Namespace.log('Unknown connection complete status:', status);
		}

		cb(status);
	}
});

/**
 * Process a completed Low-energy connection update
 *
 * @author   Sandeep Mistry <sandeep.mistry@gmail.com>
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}   status
 * @param    {Buffer}   chunk
 */
Socket.setMethod(function _processLeConnectionUpdate(status, chunk) {

	var result;

	result = {
		handle                : chunk.readUInt16LE(0),
		interval              : chunk.readUInt16LE(2) * 1.25,
		latency               : chunk.readUInt16LE(4),
		supervision_timeout   : chunk.readUInt16LE(6) * 10
	};

	if (Blast.DEBUG) {
		Namespace.log('Received connection update for handle', result.handle);
	}

	this._finalizeLeConnectionUpdate(result);
});

/**
 * Set the internal state
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Boolean}   enabled   If this instance can be used
 * @param    {String}    message   Optional message
 */
Socket.setMethod(function _setState(enabled, message) {

	// Emit the state change event if the state has actually changed
	if (this._status !== enabled) {
		this.emit('state_change', enabled, message);
	}

	// Set the internal properties
	this._status = enabled;
	this._status_message = message;

	// Emit the ready event if it's enabled
	if (enabled) {

		if (Blast.DEBUG) {
			Namespace.log('Socket is READY');
		}

		this.emitOnce('ready');
	}
});

/**
 * The socket has been activated
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function _activated(callback) {

	var that = this;

	if (Blast.DEBUG) {
		Namespace.log('Socket is ready, activating!');
	}

	if (!callback) {
		callback = Fn.thrower;
	}

	// Send these non-responding commands first
	this.setSocketFilter();

	// Then execute these in parallel
	Fn.parallel(function setEventMask(next) {
		that.setEventMask(next);
	}, function setLeEventMask(next) {
		that.setLeEventMask(next);
	}, function readLocalVersion(next) {
		that.readLocalVersion(function gotVersion(err, result) {

			if (err) {
				return next(err);
			}

			// See if this version is supported
			if (result.hci_version < 0x06) {

				if (Blast.DEBUG) {
					Namespace.log('Unsupported HCI version:', result.hci_version);
				}

				that._setState(false, 'unsupported');
				return next(new Error('HCI version is unsupported'));
			}

			next();
		});
	}, function getLocalAddress(next) {
		that.readLocalAddress(function gotAddress(err, result) {

			if (err) {
				return next(err);
			}

			if (Blast.DEBUG) {
				Namespace.log('Local address is:', result.address);
			}

			that.address_type = result.address_type;
			that.address = result.address;

			next();
		});
	}, function writeLe(next) {
		that.writeLeHostSupported(next);
	}, function readLe(next) {
		that.readLeHostSupported(next);
	}, function disableLeScan(next) {
		// Disable the LE scan, in case it has been left on
		// @TODO: Check if LE is supported first?
		that._setLeScanStatus(false, function scanStatusSet(err) {
			// Don't care about the result, continue
			next();
		});
	}, function cancelCreateLEConnection(next) {
		that.cancelCreateLEConnection(function canceledConnection(err) {
			next();
		});
	}, function done(err) {

		if (err) {
			return callback(err);
		}

		that._setState(true);
		callback(null);
	});
});

/**
 * The socket has been deactivated
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function _deactivated() {

	// Unsee the ready event
	this.unsee('ready');

});

/**
 * Cleanup
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function _cleanup() {

	var connection,
	    handle;

	// Disable LE scan
	this._setLeScanStatus(false, Fn.dummy);

	// Kill existing connections
	for (handle in this.connections) {
		connection = this.connections[handle];
		connection.disconnect();
	}
});

module.exports = Socket;