var Namespace,
    Blast = __Protoblast,
    DEFS = require('./hci_definitions'),
    Obj = Blast.Bound.Object,
    Fn = Blast.Bound.Function;

// Get the Bluejeans namespace
Namespace = Fn.getNamespace('Develry.Bluejeans');

/**
 * The Bluejeans Acl Class
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Bluejeans.Connection}   connection
 */
var Acl = Fn.inherits('Informer', 'Develry.Bluejeans', function Acl(connection) {

	// Store parent connection
	this.connection = connection;

	// Store main bluejeans instance
	this.bluejeans = connection.bluejeans;

	// Store backend
	this.backend = connection.backend;
});