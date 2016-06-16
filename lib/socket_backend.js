var BluetoothHciSocket = require('bluetooth-hci-socket'),
    Namespace,
    FLAGS = require('./hci_flags'),
    Blast = __Protoblast,
    Obj = Blast.Bound.Object,
    Fn = Blast.Bound.Function;

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

	// Initialize the socket
	this.init();
});

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
	type_mask = (1 << FLAGS.HCI_COMMAND_PKT) | (1 << FLAGS.HCI_EVENT_PKT) | (1 << FLAGS.HCI_ACLDATA_PKT);
	event_mask_1 = (1 << FLAGS.EVT_DISCONN_COMPLETE) | (1 << FLAGS.EVT_ENCRYPT_CHANGE) | (1 << FLAGS.EVT_CMD_COMPLETE) | (1 << FLAGS.EVT_CMD_STATUS);
	event_mask_2 = (1 << (FLAGS.EVT_LE_META_EVENT - 32));
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
 * Send a command to the socket
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

	var full_length = 4,
	    length = 0,
	    cmd;

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
	cmd.writeUInt8(FLAGS.HCI_COMMAND_PKT, 0);

	// Now set the sub type
	cmd.writeUInt16LE(sub_type, 1);

	// And set the actual payload length
	cmd.writeUInt8(length, 3);

	// If there is a payload, copy it into the command buffer
	if (length) {
		payload.copy(cmd, 4);
	}

	if (Blast.DEBUG) {
		Namespace.log('Sending sub_type', FLAGS.identify(sub_type), 'command:', cmd);
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
 * Set the socket event mask
 *
 * @author   Sandeep Mistry <sandeep.mistry@gmail.com>
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function setEventMask(callback) {
	this.sendCommand(FLAGS.SET_EVENT_MASK_CMD, new Buffer('fffffbff07f8bf3d', 'hex'), callback);
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
	this.sendCommand(FLAGS.LE_SET_EVENT_MASK_CMD, new Buffer('1f00000000000000', 'hex'), callback);
});

/**
 * Read the local version
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function readLocalVersion(callback) {
	this.sendCommand(FLAGS.READ_LOCAL_VERSION_CMD, null, callback);
});

/**
 * Read the local device address
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function readLocalAddress(callback) {
	this.sendCommand(FLAGS.READ_BD_ADDR_CMD, null, callback);
});

/**
 * Write le host supported command
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function writeLeHostSupported(callback) {
	this.sendCommand(FLAGS.WRITE_LE_HOST_SUPPORTED_CMD, Buffer('0100', 'hex'), callback);
});

/**
 * Read le host supported command
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function readLeHostSupported(callback) {
	this.sendCommand(FLAGS.READ_LE_HOST_SUPPORTED_CMD, null, callback);
});

/**
 * Set scan enabled
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function setScanStatus(enabled, callback) {

	var payload = new Buffer(2);

	// Enable or disable the scanning
	payload.writeUInt8(enabled ? 0x01 : 0x00, 0);

	// Filter duplicates
	payload.writeUInt8(0x01, 1);

	// Send the command
	this.sendCommand(FLAGS.LE_SET_SCAN_ENABLE_CMD, payload, callback);
});

/**
 * Set scan parameters
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Socket.setMethod(function setScanParameters(callback) {

	var payload = new Buffer(7);

	// 0 for passive, 1 for active
	payload.writeUInt8(0x01, 0);

	payload.writeUInt16LE(0x0010, 1); // internal, ms * 1.6
	payload.writeUInt16LE(0x0010, 3); // window, ms * 1.6
	payload.writeUInt8(0x00, 5); // own address type: 0 -> public, 1 -> random
	payload.writeUInt8(0x00, 6); // filter: 0 -> all event types

	// Send the command
	this.sendCommand(FLAGS.LE_SET_SCAN_PARAMETERS_CMD, payload, callback);
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
Socket.setMethod(function scan(callback) {

	var that = this;

	// Wait for the socket to be ready
	this.afterOnce('ready', function afterReady() {

		if (Blast.DEBUG) {
			Namespace.log('Starting scan');
		}

		Fn.parallel(function setStatus(next) {
			that.setScanStatus(true, next);
		}, function setParameters(next) {
			that.setScanParameters(next);
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

	switch (event_type) {

		case FLAGS.HCI_EVENT_PKT:
			this._handleEventPacket(data);
			break;

		case FLAGS.HCI_ACLDATA_PKT:
			this._handleAclDataPacket(data);
			break;

		case FLAGS.HCI_COMMAND_PKT:
			Namespace.log('COMMAND:', data);
			break;

		default:
			if (Blast.DEBUG) {
				Namespace.log('Ignoring data of unknown type:', data);
			}
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

		case FLAGS.EVT_DISCONN_COMPLETE:
			Namespace.log('Disconnect complete')
			break;

		case FLAGS.EVT_ENCRYPT_CHANGE:
			Namespace.log('Encrypt change');
			break;

		case FLAGS.EVT_CMD_COMPLETE:
			this._processCmdCompleteEvent(data);
			break;

		case FLAGS.EVT_CMD_STATUS:
			this._processCmdStatusEvent(data);
			break;

		case FLAGS.EVT_LE_META_EVENT:
			this._handleLeMetaEvent(data);
			break;
	}
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

	if (this._command_callbacks[sub_type]) {
		// Get the next command callback
		cb = this._command_callbacks[sub_type].shift();
	} else {
		if (Blast.DEBUG) {
			Namespace.log('Received COMPLETE event for sub_type', FLAGS.identify(sub_type), 'but no listeners found');
		}
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
			Namespace.log('Powered on?');
			break;

		case FLAGS.READ_RSSI_CMD:
			result.handle = chunk.readUInt16LE(0);
			result.rssi = chunk.readInt8(2);
			break;

		default:
			if (Blast.DEBUG && chunk.length) {
				Namespace.log('Unhandled sub type with response:', sub_type, chunk);
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

	Namespace.log('LE META EVENT:', FLAGS.identify(sub_type), status, chunk);

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

		default:
			if (Blast.DEBUG) {
				Namespace.log('Unknown LE meta event:', sub_type);
			}
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

	// @TODO: emit advertisement? Only after multiple discoveries? 0x04?
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

		case FLAGS.ACL_START:
			this._processAclStart(handle, data);
			break;

		case FLAGS.ACL_CONT:
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

	// @TODO: aclDataPkt
	if (Blast.DEBUG) {
		Namespace.log('@TODO: aclDataPkt', handle, cid);
	}

});

/**
 * Process status events
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Buffer}   data
 */
Socket.setMethod(function _processCmdStatusEvent(data) {

	var status,
	    cmd;

	status = data.readUInt8(3);
	cmd = data.readUInt16LE(5);

	switch (cmd) {

		case FLAGS.LE_CREATE_CONN_CMD:
			if (Blast.DEBUG) {
				Namespace.log('Got CREATE CONN update:', status, data);
			}
			break;

		default:
			if (Blast.DEBUG) {
				Namespace.log('Unknown status update:', FLAGS.identify(cmd), status, data);
			}
	}
});

/**
 * Connect to the LE device
 *
 * @author   Sandeep Mistry <sandeep.mistry@gmail.com>
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   address
 * @param    {String}   address_type   'random' or 'public'
 * @param    {Function} callback
 */
Socket.setMethod(function createLEConnection(address, address_type, callback) {

	var that = this,
	    payload = new Buffer(25);

	if (typeof address_type == 'function') {
		callback = address_type;
		address_type = 'public';
	}

	// Set the interval
	payload.writeUInt16LE(0x0060, 0);

	// Set the window
	payload.writeUInt16LE(0x0030, 2);

	// Set the initiator filter
	payload.writeUInt8(0x00, 4);

	// Set the peer address type
	payload.writeUInt8(address_type === 'public' ? 0x00 : 0x01, 5);

	// Add the peer address to the payload
	(new Buffer(address.split(':').reverse().join(''), 'hex')).copy(payload, 6);

	// Add the local address type
	payload.writeUInt8(0x00, 12);

	// Set the min interval
	payload.writeUInt16LE(0x0006, 13);

	// Set the max interval
	payload.writeUInt16LE(0x000c, 15);

	// Set the latency
	payload.writeUInt16LE(0x0000, 17);

	// Set the supervision timeout
	payload.writeUInt16LE(0x00c8, 19);

	// Set the min ce length
	payload.writeUInt16LE(0x0004, 21);

	// Set the max ce length
	payload.writeUInt16LE(0x0006, 23);

	// Only send the command after the socket is ready
	this.afterOnce('ready', function afterReady() {
		// Send the command
		that.sendCommand(FLAGS.LE_CREATE_CONN_CMD, payload, callback);
	});
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

	var result;

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

	if (status === 0) {
		this._finalizeLeConnectionComplete(result);
	} else {
		if (Blast.DEBUG) {
			Namespace.log('Unknown connection complete status:', status);
		}
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

			that.address_type = result.address_type;
			that.address = result.address;

			next();
		});
	}, function writeLe(next) {
		that.writeLeHostSupported(next);
	}, function readLe(next) {
		that.readLeHostSupported(next);
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

module.exports = Socket;