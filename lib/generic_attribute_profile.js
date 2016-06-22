var Namespace,
    Blast = __Protoblast,
    DEFS = require('./hci_definitions'),
    Obj = Blast.Bound.Object,
    Fn = Blast.Bound.Function;

// Get the Bluejeans namespace
Namespace = Fn.getNamespace('Develry.Bluejeans');

/**
 * The Bluejeans Generic Attribute Profile Class
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Bluejeans.Connection}   connection
 */
var Gatt = Fn.inherits('Informer', 'Develry.Bluejeans', function GenericAttributeProfile(connection) {

	// Store parent connection
	this.connection = connection;

	// Store main bluejeans instance
	this.bluejeans = connection.bluejeans;

	// Store backend
	this.backend = connection.backend;

	// Currently executing GATT command
	this._current_command = null;

	// Packet queue
	this._packet_queue = Fn.createQueue({limit: 1, enabled: true});

	// Current queue done callback
	this._current_queue_cb = null;

});

/**
 * Finalize incoming ACL packets
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}   cid
 * @param    {Buffer}   data
 */
Gatt.setMethod(function push(cid, data) {

	var request_type,
	    v_handle,
	    v_data,
	    uuid;

	if (cid !== DEFS.GATT.CID) {
		return Namespace.log('Unknown GATT CID:', cid);
	}

	// Compare last sent command to see if this is an echo
	if (this._current_command && this._current_command.compare(data) === 0) {
		return Namespace.log('ECHO:', data);
	}

	// Get the request type
	request_type = data[0];

	if (request_type % 2 === 0) {
		if (Blast.DEBUG) {
			Namespace.log('Replying with REQ_NOT_SUPP for', request_type.toString(16));
		}

		// @TODO: add not_supp
		return;
	}

	if (request_type == DEFS.GATT.OP.HANDLE_VALUE_NOTIF || request_type == DEFS.GATT.OP.HANDLE_VALUE_IND) {
		v_handle = data.readUInt16LE(1);
		v_data = data.slice(3);

		if (request_type == DEFS.GATT.OP.HANDLE_VALUE_IND) {
			// @TODO
			Namespace.log('Handle confirmation');
		}

		for (uuid in this.services) {
			// @TODO: characteristics
		}

		return;
	}

	if (!this._current_command) {
		return Namespace.log('No current commant found, ignoring', cid, request_type.toString(16), data);
	}

	if (request_type == DEFS.GATT.RSP_ERROR) {
		switch (data[4]) {
			case DEFS.GATT.ERROR.INSUF_AUTHENTICATION:
			case DEFS.GATT.ERROR.INSUF_AUTHORIZATION:
			case DEFS.GATT.ERROR.INSUF_ENCRYPTION:
				if (this._security !== 'medium') {
					// @TODO: encrypt the ACL stream?
					Namespace.log('TODO: encrypt acl stream');
					return;
				}
				break;
		}
	}

	Namespace.log('@TODO: execute current command callback');
	this._current_command = null;

	// @TODO: execute next command in queue
});

/**
 * Queue a packet
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Buffer}   payload
 * @param    {Function} callback
 */
Gatt.setMethod(function _sendPacket(payload, callback) {

	var that = this;

	// Queue the function
	this._packet_queue.add(function sendPacket(next) {

		// Send the packet to the device
		that.backend.sendAclData(that.connection.handle, DEFS.GATT.CID, payload, function done(err) {

			// Call the callback
			callback.apply(null, arguments);

			// This command is done, do the next
			done();
		});
	});
});

/**
 * Finalize incoming ACL packets
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}   start_handle
 * @param    {Number}   end_handle
 * @param    {Number}   group_uuid
 * @param    {Function} callback
 */
Gatt.setMethod(function readByGroupRequest(start_handle, end_handle, group_uuid, callback) {

	var payload = new Buffer(7);

	// Set the opcode
	payload.writeUInt8(DEFS.GATT.OP.REQ_READ_BY_TYPE, 0);

	// Set the start handle
	payload.writeUInt16LE(start_handle, 1);

	// Set the end handle
	payload.writeUInt16LE(end_handle, 3);

	// Set the group uuid
	payload.writeUInt16LE(group_uuid, 5);

	this._sendPacket(payload, callback);
});