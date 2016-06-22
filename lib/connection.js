var Namespace,
    Blast = __Protoblast,
    DEFS = require('./hci_definitions'),
    Obj = Blast.Bound.Object,
    Fn = Blast.Bound.Function;

// Get the Bluejeans namespace
Namespace = Fn.getNamespace('Develry.Bluejeans');

/**
 * The Bluejeans Connection Class
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Bluejeans.Backend}   backend
 * @param    {String}              handle
 */
var Connection = Fn.inherits('Informer', 'Develry.Bluejeans', function Connection(backend, handle) {

	// Store main bluejeans instance
	this.bluejeans = backend.bluejeans;

	// Store backend
	this.backend = backend;

	// Store the connection handle
	this.handle = handle;

	// Connection info goes here
	this.info = {};

	// Create a GATT instance
	this.gatt = new Namespace.GenericAttributeProfile(this);
});

/**
 * Register device connection information
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Object}   info
 */
Connection.setMethod(function updateInfo(info) {
	Obj.assign(this.info, info);
});

/**
 * Disconnect this handle
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   callback
 */
Connection.setMethod(function disconnect(callback) {
	this.backend.disconnectHandle(this.handle, callback);
});