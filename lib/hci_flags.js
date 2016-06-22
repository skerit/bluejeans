// HCI flags
this.HCI_COMMAND_PKT = 0x01;
this.HCI_ACLDATA_PKT = 0x02;
this.HCI_SCODATA_PKT = 0x03;
this.HCI_EVENT_PKT = 0x04;

this.ACL_START_NO_FLUSH = 0x00;
this.ACL_CONT  = 0x01;
this.ACL_START = 0x02;

this.EVT_DISCONN_COMPLETE = 0x05;
this.EVT_ENCRYPT_CHANGE = 0x08;
this.EVT_CMD_COMPLETE = 0x0e;
this.EVT_CMD_STATUS = 0x0f;
this.EVT_LE_META_EVENT = 0x3e;

this.EVT_LE_CONN_COMPLETE = 0x01;
this.EVT_LE_ADVERTISING_REPORT = 0x02;
this.EVT_LE_CONN_UPDATE_COMPLETE = 0x03;

this.OGF_LINK_CTL = 0x01;
this.OCF_DISCONNECT = 0x0006;

this.OGF_HOST_CTL = 0x03;
this.OCF_SET_EVENT_MASK = 0x0001;
this.OCF_READ_LE_HOST_SUPPORTED = 0x006C;
this.OCF_WRITE_LE_HOST_SUPPORTED = 0x006D;

this.OGF_INFO_PARAM = 0x04;
this.OCF_READ_LOCAL_VERSION = 0x0001;
this.OCF_READ_BD_ADDR = 0x0009;

this.OGF_STATUS_PARAM = 0x05;
this.OCF_READ_RSSI = 0x0005;

// 1
this.OCF_LE_SET_EVENT_MASK = 0x0001;

// 8
this.OGF_LE_CTL = 0x08;

// 11
this.OCF_LE_SET_SCAN_PARAMETERS = 0x000b;

// 12
this.OCF_LE_SET_SCAN_ENABLE = 0x000c;

// 13
this.OCF_LE_CREATE_CONN = 0x000d;

// 25
this.OCF_LE_START_ENCRYPTION = 0x0019;

this.DISCONNECT_CMD = this.OCF_DISCONNECT | this.OGF_LINK_CTL << 10;

this.SET_EVENT_MASK_CMD = this.OCF_SET_EVENT_MASK | this.OGF_HOST_CTL << 10;
this.READ_LE_HOST_SUPPORTED_CMD = this.OCF_READ_LE_HOST_SUPPORTED | this.OGF_HOST_CTL << 10;
this.WRITE_LE_HOST_SUPPORTED_CMD = this.OCF_WRITE_LE_HOST_SUPPORTED | this.OGF_HOST_CTL << 10;

this.READ_LOCAL_VERSION_CMD = this.OCF_READ_LOCAL_VERSION | (this.OGF_INFO_PARAM << 10);
this.READ_BD_ADDR_CMD = this.OCF_READ_BD_ADDR | (this.OGF_INFO_PARAM << 10);

this.READ_RSSI_CMD = this.OCF_READ_RSSI | this.OGF_STATUS_PARAM << 10;

// 19
this.HCI_OE_USER_ENDED_CONNECTION = 0x13;

this.LE_SET_EVENT_MASK_CMD = this.OCF_LE_SET_EVENT_MASK | this.OGF_LE_CTL << 10;

// 8203
this.LE_SET_SCAN_PARAMETERS_CMD = this.OCF_LE_SET_SCAN_PARAMETERS | this.OGF_LE_CTL << 10;

// 8204
this.LE_SET_SCAN_ENABLE_CMD = this.OCF_LE_SET_SCAN_ENABLE | this.OGF_LE_CTL << 10;

// 8205
this.LE_CREATE_CONN_CMD = this.OCF_LE_CREATE_CONN | this.OGF_LE_CTL << 10;

this.LE_START_ENCRYPTION_CMD = this.OCF_LE_START_ENCRYPTION | this.OGF_LE_CTL << 10;

// HCI status
this.STATUS_MAPPER = [
	'Success',
	'Unknown HCI Command',
	'Unknown Connection Identifier',
	'Hardware Failure',
	'Page Timeout',
	'Authentication Failure',
	'PIN or Key Missing',
	'Memory Capacity Exceeded',
	'Connection Timeout',
	'Connection Limit Exceeded',
	'Synchronous Connection Limit to a Device Exceeded',
	'ACL Connection Already Exists',
	'Command Disallowed',
	'Connection Rejected due to Limited Resources',
	'Connection Rejected due to Security Reasons',
	'Connection Rejected due to Unacceptable BD_ADDR',
	'Connection Accept Timeout Exceeded',
	'Unsupported Feature or Parameter Value',
	'Invalid HCI Command Parameters',
	'Remote User Terminated Connection',
	'Remote Device Terminated due to Low Resources',
	'Remote Device Terminated due to Power Off',
	'Connection Terminated By Local Host',
	'Repeated Attempts',
	'Pairing Not Allowed',
	'Unknown LMP PDU',
	'Unsupported Remote Feature / Unsupported LMP Feature',
	'SCO Offset Rejected',
	'SCO Interval Rejected',
	'SCO Air Mode Rejected',
	'Invalid LMP Parameters / Invalid LL Parameters',
	'Unspecified Error',
	'Unsupported LMP Parameter Value / Unsupported LL Parameter Value',
	'Role Change Not Allowed',
	'LMP Response Timeout / LL Response Timeout',
	'LMP Error Transaction Collision',
	'LMP PDU Not Allowed',
	'Encryption Mode Not Acceptable',
	'Link Key cannot be Changed',
	'Requested QoS Not Supported',
	'Instant Passed',
	'Pairing With Unit Key Not Supported',
	'Different Transaction Collision',
	'Reserved',
	'QoS Unacceptable Parameter',
	'QoS Rejected',
	'Channel Classification Not Supported',
	'Insufficient Security',
	'Parameter Out Of Manadatory Range',
	'Reserved',
	'Role Switch Pending',
	'Reserved',
	'Reserved Slot Violation',
	'Role Switch Failed',
	'Extended Inquiry Response Too Large',
	'Secure Simple Pairing Not Supported By Host',
	'Host Busy - Pairing',
	'Connection Rejected due to No Suitable Channel Found',
	'Controller Busy',
	'Unacceptable Connection Parameters' ,
	'Directed Advertising Timeout',
	'Connection Terminated due to MIC Failure',
	'Connection Failed to be Established',
	'MAC Connection Failed',
	'Coarse Clock Adjustment Rejected but Will Try to Adjust Using Clock Dragging'
];

/**
 * Do a reverse lookup of an id
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}   id
 *
 * @return   {String|undefined}
 */
this.reverseLookup = function reverseLookup(id) {

	var key;

	for (key in this) {
		if (this[key] === id) {
			return key;
		}
	}
};

/**
 * Identify a number
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}   id
 *
 * @return   {String}
 */
this.identify = function identify(id) {

	var name = this.reverseLookup(id),
	    result = '' + id;

	if (name) {
		result += ' (' + name + ')';
	} else {
		result += ' (unknown)';
	}

	return result;
};