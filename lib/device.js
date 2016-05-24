var ChildProcess = require('child_process'),
    Blast,
    Obj,
    Fn;

if (typeof __Protoblast != 'undefined') {
	Blast = __Protoblast;
} else {
	Blast = require('protoblast')(false);
}

Obj = Blast.Bound.Object;
Fn = Blast.Bound.Function;

/**
 * The Bluejeans Device Class
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Device = Fn.inherits('Informer', 'Develry.Bluejeans', function Device(parent, address, name) {

	// Parent Bluejeans instance
	this.parent = parent;

	// Mac address
	this.address = address;

	// Optional name
	this.name = name;

	// Is this paired?
	this.paired = false;

	// RSSI values for lowpass filter
	this.rssi_values = [];
});

/**
 * Perform a hci command
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function} callback
 */
Device.setMethod(function command(args, pre_connect, callback) {

	var that = this,
	    result = '';

	if (typeof pre_connect == 'function') {
		callback = pre_connect;
		pre_connect = null;
	}

	if (!callback) {
		callback = Fn.thrower;
	}

	if (pre_connect == null) {
		pre_connect = true;
	}

	if (!Array.isArray(args)) {
		args = [args];
	}

	Fn.series(function connect(next) {

		var error,
		    proc;

		if (!pre_connect) {
			return next();
		}

		proc = that.parent._spawn('cc', that.address);

		proc.stderr.on('data', function onErr(data) {
			error = '' + data;
		});

		// Wait for the process to exit
		proc.on('exit', function onExit() {
			if (error) {
				console.error('CC warning: ' + error);
			}

			next(null);
		});
	}, function do_command(next) {

		var error,
		    proc;

		if (!args.length) {
			return next();
		}

		proc = that.parent._spawn(args);

		proc.stdout.on('data', function output(data) {
			result += data;
		});

		proc.stderr.on('data', function onErr(data) {
			error = '' + data;
		});

		// Wait for the process to exit
		proc.on('exit', function onExit() {
			if (error) {
				return next(new Error(error));
			}

			next(null);
		});
	}, function done(err) {

		if (err) {
			return callback(err);
		}

		callback(null, result);
	});

});

/**
 * Pair the device
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function} callback
 */
Device.setMethod(function pair(callback) {

	var that = this;

	if (!callback) {
		callback = Fn.thrower;
	}

	that.command('auth', function authenticated(err, response) {

		if (err) {
			return callback(err);
		}

		that.paired = true;
		that.emit('paired');

		callback(null);
	});
});

/**
 * Get rssi
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function} callback
 */
Device.setMethod(function getRssi(pre_connect, callback) {

	var that = this;

	if (typeof pre_connect == 'function') {
		callback = pre_connect;
		pre_connect = null;
	}

	if (!callback) {
		callback = Fn.thrower;
	}

	if (pre_connect == null) {
		pre_connect = true;
	}

	that.command(['rssi', this.address], pre_connect, function gotRssi(err, response) {

		var value;

		if (err) {
			return callback(err);
		}

		if (!response) {
			value = NaN;
		} else {
			value = Number(Blast.Bound.String.after(response, 'RSSI return value:'));
		}

		callback(null, value);
	});
});

/**
 * Get transmit power level
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function} callback
 */
Device.setMethod(function getTpl(pre_connect, callback) {

	var that = this;

	if (typeof pre_connect == 'function') {
		callback = pre_connect;
		pre_connect = null;
	}

	if (!callback) {
		callback = Fn.thrower;
	}

	if (pre_connect == null) {
		pre_connect = true;
	}

	that.command(['tpl', this.address], pre_connect, function gotRssi(err, response) {

		var value;

		if (err) {
			return callback(err);
		}

		if (!response) {
			value = NaN;
		} else {
			value = Number(Blast.Bound.String.after(response, 'Current transmit power level:'));
		}

		callback(null, value);
	});
});

/**
 * Get link quality
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function} callback
 */
Device.setMethod(function getLq(pre_connect, callback) {

	var that = this;

	if (typeof pre_connect == 'function') {
		callback = pre_connect;
		pre_connect = null;
	}

	if (!callback) {
		callback = Fn.thrower;
	}

	if (pre_connect == null) {
		pre_connect = true;
	}

	that.command(['lq', this.address], pre_connect, function gotRssi(err, response) {

		var value;

		if (err) {
			return callback(err);
		}

		if (!response) {
			value = NaN;
		} else {
			value = Number(Blast.Bound.String.after(response, 'Link quality:'));
		}

		callback(null, value);
	});
});

/**
 * Get link information
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function} callback
 */
Device.setMethod(function linkInfo(callback) {

	var that = this;

	if (!callback) {
		callback = Fn.thrower;
	}

	that.command([], true, function connected(err) {

		var rssi,
		    tpl,
		    lq;

		if (err) {
			return callback(err);
		}

		Fn.parallel(function getRssi(next) {
			that.getRssi(false, function gotRssi(err, value) {

				if (err) {
					return next(err);
				}

				rssi = value;
				return next();
			});
		}, function getTpl(next) {
			that.getTpl(false, function gotTpl(err, value) {

				if (err) {
					return next(err);
				}

				tpl = value;
				next();
			});
		}, function getLq(next) {
			that.getLq(false, function gotLq(err, value) {

				if (err) {
					return next(err);
				}

				lq = value;
				return next();
			})
		}, function done(err) {

			if (err) {
				console.error('ERROR: ' + err);
				return callback(err);
			}

			console.log('RSSI: ' + rssi);
			console.log('TPL: ' + tpl);
			console.log('LQ: ' + lq);

			callback(null, rssi, tpl, lq);
		});
	});
});

/**
 * Calculate distance
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function} callback
 */
Device.setMethod(function getDistance(callback) {
	var that = this;

	this.linkInfo(function gotInfo(err, rssi, tpl, lq) {

		var result,
		    temp;

		if (err) {
			return callback(err);
		}

		rssi += 10;

		if (isNaN(rssi)) {
			rssi = 1;
		} else if (rssi < 1) {
			rssi = 0.5;
		}

		temp = ~~(rssi * (10 - tpl) * (lq / 85));

		console.log('TEMP: ' + temp);

		that.rssi_values.push(temp);

		// Remove top value
		if (that.rssi_values.length > 5) {
			that.rssi_values.shift();
		}

		console.log('VALUES: ' + that.rssi_values)

		temp = Blast.Bound.Math.lowpass(that.rssi_values, 0.25);

		result = temp[temp.length - 1];

		callback(null, result);
	});
});


module.exports = Device;