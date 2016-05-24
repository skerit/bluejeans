var ChildProcess = require('child_process'),
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

/**
 * The Bluejeans Class
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Bluejeans = Fn.inherits('Informer', 'Develry', function Bluejeans(options) {

	if (!options) {
		options = {};
	}

	// hcitool executable path
	this.hcitool = options.hcitool || '/usr/bin/hcitool';

	// Main bluetooth device to use
	this.device = options.device || 'hci0';

	// Devices
	this.devices_seen = {};

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
 * Scan for devices, callback when finished
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   callback
 */
Bluejeans.setMethod(function scan(callback) {

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
			device = that.createDevice(result[1], result[2]);

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
Bluejeans.setMethod(function createDevice(address, name) {

	if (!this.devices_seen[address]) {
		this.devices_seen[address] = new Device(this, address, name);
	}

	return this.devices_seen[address];
});

module.exports = Bluejeans;