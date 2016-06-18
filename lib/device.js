var Namespace,
    Blast = __Protoblast,
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

	// Connection info
	this.connection_info = {};

	// Advert info
	this.advert_info = {};

	// EIR info
	this.eir_info = {};

	// The name of the device
	this.name = '';
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
		this.emitOnce('connected');
	} else {
		this.unsee('connected');
	}
});

/**
 * Do something when connected
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   callback
 */
Device.setMethod(function whenConnected(callback) {
	this.afterOnce('connected', callback);
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
});

module.exports = Device;