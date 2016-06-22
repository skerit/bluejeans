var Namespace,
    Blast = __Protoblast,
    DEFS = require('./hci_definitions'),
    Obj = Blast.Bound.Object,
    Fn = Blast.Bound.Function;

// Get the Bluejeans namespace
Namespace = Fn.getNamespace('Develry.Bluejeans');

/**
 * The Bluejeans Device Class
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Bluejeans}   bluejeans
 * @param    {String}      address
 */
var Device = Fn.inherits('Informer', 'Develry.Bluejeans', function Device(bluejeans, address) {

	var that = this;

	// Parent Bluejeans instance
	this.bluejeans = bluejeans;

	// The current backend
	this.backend = bluejeans.backend;

	// The device address
	this.address = address;

	// Make the device register itself
	this.backend.devices[address] = this;

	// LE Connection features
	this.features = null;

	// Connection info
	this.connection_info = {};

	// Advert info
	this.advert_info = {};

	// EIR info
	this.eir_info = {};

	// Is this an LE device?
	this.is_le = true;

	// The name of the device
	this.name = '';

	// Amount of adverts seen
	this.advert_count = 0;

	// Amount of adverts per second
	this.aps = 0;
});

/**
 * Handle property
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @type {Number}
 */
Device.setProperty(function handle() {
	return this._handle;
}, function setHandle(value) {

	// Set the value
	this._handle = value;

	if (this._handle) {
		this.emitOnce('handle');
	} else {
		this.unsee('handle');
	}
});

/**
 * Connection instance
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @type {Bluejeans.Connection}
 */
Device.setProperty(function connection() {
	if (this.connected) {
		return this.backend.connections[this.handle];
	}
});

/**
 * Connected property
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @type {Boolean}
 */
Device.setProperty(function connected() {
	return !!this._connected;
}, function setConnected(value) {

	// Set the value
	this._connected = !!value;

	if (this._connected) {
		this.unsee('disconnected');
		this.emitOnce('connected');
	} else {
		this.unsee('connected');
		this.emitOnce('disconnected');
	}
});

/**
 * Do something when the device has connected
 * And the handle is ready
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   callback
 */
Device.setMethod(function whenConnected(callback) {

	var that = this;

	Fn.parallel(function testConnection(next) {
		that.afterOnce('connected', next);
	}, function testHandle(next) {
		that.afterOnce('handle', next);
	}, function ready(err) {

		if (err) {
			return callback(err);
		}

		callback(null);
	});
});

/**
 * Actually create a connection to the device
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   callback
 */
Device.setMethod(function connect(callback) {

	if (this.connected) {
		return setImmediate(callback);
	}

	// @TODO: non-le connections
	// @TODO: address type?
	this.backend._createLeConnection(this.address, callback);
});

/**
 * Let the device know it's disconnected
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}   reason
 */
Device.setMethod(function _disconnected(reason) {

	// We're no longer connected, emit the appropriate event
	this.connected = false;

	// Set the reason
	this.disconnection_reason = reason;

	if (Blast.DEBUG) {
		Namespace.log('Device', this.address, 'disconnected because:', DEFS.ERROR.identify(reason));
	}
});

/**
 * Get the used features
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   callback
 */
Device.setMethod(function getUsedFeatures(callback) {

	var that = this;

	Fn.series(function getFeatures(next) {

		// If we already have the features, use those
		if (that.features) {
			return next();
		}

		// Wait for a connection with a handle
		this.whenConnected(function connected() {

			// Get the features
			that.backend.readLeRemoteUsedFeatures(that.handle, function gotFeatures(err, result) {

				if (err) {
					return callback(err);
				}

				// Store them for later
				that.features = result;

				next();
			});
		});
	}, function done(err) {

		if (err) {
			return callback(err);
		}

		callback(null, that.features);
	});
});

/**
 * Update device information
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Object}   info
 */
Device.setMethod(function updateInfo(info) {

	var key,
	    val;

	if (Blast.DEBUG) {
		Namespace.log('Updating', this.address, 'info', info);
	}

	if (info.handle) {
		Obj.assign(this.connection_info, info);
		return;
	}

	// Copy in the advert info
	Obj.assign(this.advert_info, info);

	// Copy in the eir
	Obj.assign(this.eir_info, info.eir);

	if (info.eir && info.eir.local_name) {
		this.name = info.eir.local_name;
	}

	// Update the connection handle
	if (this.connection_info && this.connection_info.handle) {
		this.handle = this.connection_info.handle;
	}
});

/**
 * Process an advert
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Object}   advert
 */
Device.setMethod(function processAdvert(advert) {

	// Update info
	this.updateInfo(advert);

	// Increase the advert seen counter
	this.advert_count++;

	// Emit rssi info, if it's available
	if (typeof advert.rssi == 'number') {
		this.emit('rssi', advert.rssi);
	}

	// Emit the advert on  the device itself
	this.emit('advert', advert);
});

/**
 * Get adverts per second
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   callback
 */
Device.setMethod(function getAdvertsPerSecond(callback) {

	var that = this;

	if (this._advert_counter == null) {
		this.countAdverts();
	}

	if (this._sample_count) {
		return setImmediate(function giveaps() {
			callback(null, that.aps);
		});
	}

	this.afterOnce('aps', function gotAdvertCounts() {
		callback(null, that.aps);
	});
});

/**
 * Create an advert counter
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Device.setMethod(function countAdverts() {

	var that = this,
	    last_seen,
	    samples,
	    start;

	if (this._advert_counter != null) {
		return;
	}

	// Keep track of sample count
	this._sample_count = 0;

	// Counter samples will be stored in here
	samples = [];

	// Start time
	start = Date.now();

	// Last amount of adverts seen
	last_seen = this.advert_count;

	this._advert_counter = setInterval(function count() {

		var duration = Date.now() - start,
		    amount = that.advert_count - last_seen,
		    aps = Math.round((amount / duration) * 1000);

		that.aps = aps;

		// Increase the sample count, only if we've seen adverts
		if (amount) {
			that._sample_count++;
		}

		// Stop counting after a while
		if (that._sample_count > 3) {
			clearInterval(that._advert_counter);
			that.emit('aps', aps);
			return;
		}

		// Reset the counters
		start = Date.now();
		last_seen = that.advert_count;

	}, 1000);
});

module.exports = Device;