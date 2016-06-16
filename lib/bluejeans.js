var ChildProcess = require('child_process'),
    Namespace,
    byline = require('byline'),
    Device = require('./device.js'),
    Blast,
    Obj,
    Fn,
    fs = require('fs');

if (typeof __Protoblast != 'undefined') {
	Blast = __Protoblast;
} else {
	Blast = require('protoblast')(false);
}

Obj = Blast.Bound.Object;
Fn = Blast.Bound.Function;

// Get the Rudeplay namespace
Namespace = Fn.getNamespace('Develry.Bluejeans');

/**
 * The Bluejeans Class
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Bluejeans = Fn.inherits('Informer', 'Develry.Bluejeans', function Bluejeans(options) {

	if (!options) {
		options = {};
	}

	// hcitool executable path
	this.hcitool = options.hcitool || '/usr/bin/hcitool';

	// Main bluetooth device to use
	this.device = options.device || 'hci0';

	// Devices
	this.devices_seen = {};

	this.backend = new Namespace.SocketBackend(this);
});

/**
 * Spanw hci process
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Array}   args
 */
Bluejeans.setMethod(function _spawn(user_args) {

	var args,
	    proc,
	    i;

	// Always start by specifying the device
	args = ['-i', this.device];

	if (!Array.isArray(user_args)) {
		for (i = 0; i < arguments.length; i++) {
			args.push(arguments[i]);
		}
	} else {
		for (i = 0; i < user_args.length; i++) {
			args.push(user_args[i]);
		}
	}

	proc = ChildProcess.spawn(this.hcitool, args);

	return proc;
});

/**
 * Do something when noble is ready
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   callback
 */
Bluejeans.setMethod(function whenNobleReady(callback) {
	// If noble is ready, do it ASAP
	if (noble_ready) {
		setImmediate(callback);
	} else {
		// Listen to the state change
		noble.once('stateChange', function onChange(state) {
			// If it finally powers on, do it
			if (state === 'poweredOn') {
				callback();
			} else {
				// Schedule again
				whenNobleReady(callback);
			}
		});
	}
});

/**
 * Scan for devices
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Boolean}    type       null for all, true for LE, false for lower
 * @param    {Function}   callback
 */
Bluejeans.setMethod(function scan(type, callback) {

	var that = this,
	    results = [];

	if (typeof type == 'function') {
		callback = type;
		type = null;
	}

	Fn.parallel(function scanLe(next) {

		if (type || type === false) {
			return next();
		}

		that.scanLe(function gotLeDevices(err, devices) {

			if (err) {
				return next(err);
			}

			results = results.concat(devices);
			next();
		});
	}, function scanOld(next) {

		if (type === true) {
			return next();
		}

		that.scanHci(function gotOldDevices(err, devices) {

			if (err) {
				return next(err);
			}

			results = results.concat(devices);
			next();
		});
	}, function done(err) {

		if (err) {
			return callback(err);
		}

		callback(null, results);
	});
});

/**
 * Scan for LE devices
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}     timeout
 * @param    {Function}   callback
 */
Bluejeans.setMethod(function scanLe(timeout, callback) {

	var that = this,
	    results = [];

	if (typeof timeout == 'function') {
		callback = timeout;
		timeout = 4500;
	}

	// Wait for noble to be ready
	this.whenNobleReady(function onReady() {

		var bomb = Fn.timebomb(timeout, function timedOut() {

			// Stop the scan
			noble.stopScanning();

			// Remove the discovery listener
			noble.removeListener('discover', onDiscover);

			// Callback with the results
			callback(null, results);
		});

		// Initiate the scan
		noble.startScanning();

		// Listen for devices
		noble.on('discover', onDiscover);

		// The actual discover listener
		function onDiscover(peripheral) {
			results.push(that.createLeDevice(peripheral));
		}
	});
});

/**
 * Scan for devices, callback when finished
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   callback
 */
Bluejeans.setMethod(function scanHci(callback) {

	var that = this,
	    cleanup,
	    list = [],
	    scan;

	scan = this._spawn('scan');

	cleanup = Fn.regulate(function cleanup(err) {
		callback(err, list);
	});

	byline(scan.stdout).on('data', function gotData(data) {

		var result = /\t((?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2}))\t(.*)/.exec(data),
		    device;

		if (result && result[1]) {
			device = that.createHciDevice(result[1], result[2]);

			if (device) {
				list.push(device);
			}
		}
	});

	scan.stdout.on('end', function onEnd() {
		cleanup();
	});
});

/**
 * Register a device internally
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   address
 * @param    {String}   name
 */
Bluejeans.setMethod(function createHciDevice(address, name) {

	if (!this.devices_seen[address]) {
		this.devices_seen[address] = new Device(this, address, name);
	}

	return this.devices_seen[address];
});

/**
 * Register an LE internally
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Object}   peripheral
 */
Bluejeans.setMethod(function createLeDevice(peripheral) {

	var address = peripheral.address;

	if (!this.devices_seen[address]) {
		this.devices_seen[address] = new Device(this, peripheral);
	}

	return this.devices_seen[address];
});

/**
 * Debug log
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Namespace.log = function log() {

	var args = ['[' + Date.now() + ']'].concat(Blast.Bound.Array.cast(arguments));

	return console.log.apply(console, args);
};

module.exports = Bluejeans;