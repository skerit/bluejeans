var Namespace,
    Blast = __Protoblast,
    Obj = Blast.Bound.Object,
    Fn = Blast.Bound.Function;

// Get the Bluejeans namespace
Namespace = Fn.getNamespace('Develry.Bluejeans');

/**
 * The Basic Bluejeans Backend Class
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Backend = Fn.inherits('Informer', 'Develry.Bluejeans', function Backend(bluejeans, options) {

	var that = this;

	// Parent Bluejeans instance
	this.bluejeans = bluejeans;

	// The options
	this.options = Obj.assign({}, this.default_options, options);

	// Map handles to Connections
	this.connections = {};

	// Device instances
	this.devices = {};

	// Listen to exists
	process.on('exit', function onExit() {
		that.cleanup();
	});

	// Listen to sigints
	process.on('SIGINT', function onSigint() {
		that.cleanup();
		process.exit();
	});
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
Backend.setProperty('default_options', {});

/**
 * Default EIR result
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @type {Object}
 */
Backend.setProperty('default_eir_result', {
	local_name        : '',
	tx_power_level    : 0,
	manufacturer_data : null
});

/**
 * Convert buffer to an address string
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Backend.setMethod(function bufToAddress(chunk, delimiter) {

	if (delimiter == null) {
		delimiter = ':';
	}

	return chunk.toString('hex').match(/.{1,2}/g).reverse().join(delimiter);
});

/**
 * Process the EIR buffer
 *
 * @author   Sandeep Mistry <sandeep.mistry@gmail.com>
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Buffer}   chunk
 * @param    {Object}   result   The previously seen result
 */
Backend.setMethod(function processEir(chunk, result) {

	var service_uuid,
	    service_data,
	    data_uuid,
	    length,
	    bytes,
	    type,
	    i,
	    j;

	if (!result) {
		result = Obj.assign({}, this.default_eir_result, {
			service_uuids : [],
			service_datas : []
		});
	}

	i = 0;

	while (i + 1 < chunk.length) {
		length = chunk.readUInt8(i);

		// Ignore invalid eir chunks
		if (length < 1) {
			break;
		}

		// Break when going out of the buffer range
		if ((i + length + 1) > chunk.length) {
			break;
		}

		// https://www.bluetooth.org/en-us/specification/assigned-numbers/generic-access-profile
		type = chunk.readUInt8(i + 1);
		bytes = chunk.slice(i + 2).slice(0, length - 1);

		switch (type) {

			case 0x02: // Incomplete List of 16-bit Service Class UUID
			case 0x03: // Complete List of 16-bit Service Class UUIDs
				for (j = 0; j < bytes.length; j += 2) {
					service_uuid = bytes.readUInt16LE(j).toString(16);

					// Add it to the service uuids array if it isn't in there already
					if (result.service_uuids.indexOf(service_uuid) === -1) {
						result.service_uuids.push(service_uuid);
					}
				}
				break;

			case 0x08: // Shortened Local Name
			case 0x09: // Complete Local Name
				result.local_name = bytes.toString('utf8');
				break;

			case 0x0a: // Tx Power Level
				result.tx_power_level = bytes.readInt8(0);
				break;

			case 0x16: // Service Data, there can be multiple occurences
				data_uuid = this.bufToAddress(bytes.slice(0, 2), '');
				service_data = bytes.slice(2, bytes.length);

				// @TODO: won't this cause a massive memory leak in some cases?
				result.service_datas.push({
					uuid: data_uuid,
					data: service_data
				});
				break;

			case 0xff: // Manufacturer Specific Data
				result.manufacturer_data = bytes;
				break;
		}

		i += length + 1;
	}

	return result;
});

/**
 * Get or create a connection by handle
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   handle
 *
 * @return   {Bluejeans.Connection}
 */
Backend.setMethod(function getConnection(handle) {

	// Make sure the connection instance is created
	if (!this.connections[handle]) {
		this.connections[handle] = new Namespace.Connection(this, handle);
	}

	return this.connections[handle];
});

/**
 * Upsert device by address
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   address
 *
 * @return   {Device}
 */
Backend.setMethod(function getDeviceByAddress(address) {

	if (!address) {
		return;
	}

	// Make sure the device exists
	if (!this.devices[address]) {
		new Namespace.Device(this.bluejeans, address);
	}

	return this.devices[address];
});

/**
 * Update or create a device
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Bluejeans.Connection}   connection
 *
 * @return   {Device}
 */
Backend.setMethod(function getDeviceByConnection(connection) {

	var address,
	    device;

	if (!connection) {
		return;
	}

	address = connection.info.address;

	if (!address) {
		return;
	}

	device = this.getDeviceByAddress(address);

	if (!device) {
		return;
	}

	// If the info variable is still truthy,
	// it's an object containing device information
	if (connection.info) {
		device.updateInfo(connection.info);
	}

	return device;
});

/**
 * Register device connection information
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   address
 *
 * @return   {Device}
 */
Backend.setMethod(function registerDeviceConnectionByAddress(address) {

	var connection,
	    device;

	if (!address) {
		return;
	}

	// Get the device
	device = this.getDeviceByAddress(address);



});

/**
 * Register device connection information
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Object}   info
 *
 * @return   {Device}
 */
Backend.setMethod(function registerDeviceConnection(info) {

	var connection,
	    device;

	if (info.handle) {

		// Get the connection instance
		connection = this.getConnection(info.handle);

		// Update the connection info
		connection.updateInfo(info);
	}

	if (info.address) {
		device = this.getDeviceByAddress(info.address);
	} else {
		// Upsert the device information
		device = this.getDeviceByConnection(connection);
	}

	if (device) {
		// Update the info there, too
		device.updateInfo(info);

		device.connected = true;
	}

	return device;
});

/**
 * Register device disconnect
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Object}   info
 *
 * @return   {Device}
 */
Backend.setMethod(function registerDeviceDisconnect(handle, reason) {

	var connection,
	    device;

	// See if there is an info object available
	connection = this.getConnection(handle);

	if (!connection) {
		return Namespace.log('Unknown connection', handle, 'disconnected');
	}

	if (!connection.info.address) {
		// @TODO: Code below is from before the connection class was added
		return Namespace.log('Unknown device disconnected', handle);
	}

	device = this.getDeviceByConnection(connection);

	if (device) {
		// Tell the device it's disconnected
		device._disconnected(reason);
	}
});

/**
 * Scan for regular devices
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Backend.setMethod(function scan(callback) {

	if (!callback) {
		callback = Fn.thrower;
	}

	if (typeof this._scan !== 'function') {
		return callback(new Error('Scan method not implemented in ' + this.constructor.name));
	}

	this._scan(callback);
});

/**
 * Scan for Low-Energy devices
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Backend.setMethod(function leScan(callback) {

	if (!callback) {
		callback = Fn.thrower;
	}

	if (typeof this._leScan !== 'function') {
		return callback(new Error('LE scan method not implemented in ' + this.constructor.name));
	}

	this._leScan(callback);
});

/**
 * Create a Link Layer connection to a connectable advertiser.
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   address
 * @param    {String}   address_type   'random' or 'public'
 * @param    {Function} callback
 *
 * @return   {Device}
 */
Backend.setMethod(function createLeConnection(address, address_type, callback) {

	var device = new Namespace.Device(this.bluejeans, address);

	this._createLeConnection(address, address_type, callback);

	return device;
});

/**
 * Process completed Low-energy connection
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Object}   info
 * @param    {Function} callback
 */
Backend.setMethod(function _finalizeLeConnectionComplete(info, callback) {

	var result = this.registerDeviceConnection(info);

	this.emit('le_connection', result);

	// @TODO: noble creates connections to other devices that are
	// in a queue after each connection complete

	callback(null, info);
});

/**
 * Update the connection.
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Object}   info
 */
Backend.setMethod(function _finalizeLeConnectionUpdate(info) {

	var result = this.registerDeviceConnection(info);

	this.emit('le_connection_update', this.connections[info.handle]);
});

/**
 * Process discovery:
 * Create a device instance, emit 'advert' event
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Object}   advert
 */
Backend.setMethod(function processDiscovery(advert) {

	var device = this.getDeviceByAddress(advert.address);

	if (device) {
		device.processAdvert(advert);
	}

	this.emit('advert', advert, device);
});


/**
 * Destroy this backend
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Backend.setMethod(function destroy() {

	// Cleanup first
	this.cleanup();

	if (typeof this._destroy == 'function') {
		this._destroy();
	}

	this.is_destroyed = true;
});

/**
 * Cleanup this backend
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Backend.setMethod(function cleanup() {

	// Destroying will already have cleaned this up
	if (this.is_cleaned_up) {
		return;
	}

	this.is_cleaned_up = true;

	if (Blast.DEBUG) {
		Namespace.log('Cleaning up ...');
	}

	if (typeof this._cleanup == 'function') {
		this._cleanup();
	}
});

module.exports = Backend;