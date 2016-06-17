/******************************************************************************
 *
 *  Codes have been taken from the Bluedroid project:
 *  https://android.googlesource.com/platform/external/bluetooth/bluedroid/+/master/stack/include/hcidefs.h
 *
 *  Copyright (C) 1999-2014 Broadcom Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at:
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 ******************************************************************************/
var self = this;

/**
 * Common definitions
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
this.COMMAND_NONE = 0x0000;

/**
 * Protocol version information
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
this.PROTO = {
	VERSION      : 0x01,    // BT 1.1
	VERSION_1_2  : 0x02,    // BT 1.2
	VERSION_2_0  : 0x03,    // BT 2.0
	VERSION_2_1  : 0x04,    // BT 2.1
	VERSION_3_0  : 0x05,    // BT 3.0
	REVISION     : 0x000C   // Current implementation version ?
};

/**
 * Message tyoe defubutuibs (for H4 messages)
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
this.TYPE = {
	COMMAND   : 1,
	ACL_DATA  : 2,
	SCO_DATA  : 3,
	EVENT     : 4,
	LM_DIAG   : 7,
	NFC       : 16,
};

/**
 * Definitions for HCI groups
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
this.GRP = {
	LINK_CONTROL_CMDS       : 0x01 << 10, // 0x0400
	LINK_POLICY_CMDS        : 0x02 << 10, // 0x0800
	HOST_CONT_BASEBAND_CMDS : 0x03 << 10, // 0x0C00
	INFORMATIONAL_PARAMS    : 0x04 << 10, // 0x1000
	STATUS_PARAMS           : 0x05 << 10, // 0x1400
	TESTING_CMDS            : 0x06 << 10, // 0x1800
	BLE_CMDS                : 0x08 << 10, // 0x2000 (BLE)
	VENDOR_SPECIFIC         : 0x3F << 10, // 0xFC00
	LINK                    : {},
	HOST                    : {}
};

/**
 * Definitions for Link control commands
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
this.GRP.LINK.CONTROL = {
	INQUIRY                    : 0x0001 | self.GRP.LINK_CONTROL_CMDS,
	INQUIRY_CANCEL             : 0x0002 | self.GRP.LINK_CONTROL_CMDS,
	PERIODIC_INQUIRY_MODE      : 0x0003 | self.GRP.LINK_CONTROL_CMDS,
	EXIT_PERIODIC_INQUIRY_MODE : 0x0004 | self.GRP.LINK_CONTROL_CMDS,
	CREATE_CONNECTION          : 0x0005 | self.GRP.LINK_CONTROL_CMDS,
	DISCONNECT                 : 0x0006 | self.GRP.LINK_CONTROL_CMDS,
	ADD_SCO_CONNECTION         : 0x0007 | self.GRP.LINK_CONTROL_CMDS,
	CREATE_CONNECTION_CANCEL   : 0x0008 | self.GRP.LINK_CONTROL_CMDS,
	ACCEPT_CONNECTION_REQUEST  : 0x0009 | self.GRP.LINK_CONTROL_CMDS,
	REJECT_CONNECTION_REQUEST  : 0x000A | self.GRP.LINK_CONTROL_CMDS,
	LINK_KEY_REQUEST_REPLY     : 0x000B | self.GRP.LINK_CONTROL_CMDS,
	LINK_KEY_REQUEST_NEG_REPLY : 0x000C | self.GRP.LINK_CONTROL_CMDS,
	PIN_CODE_REQUEST_REPLY     : 0x000D | self.GRP.LINK_CONTROL_CMDS,
	PIN_CODE_REQUEST_NEG_REPLY : 0x000E | self.GRP.LINK_CONTROL_CMDS,
	CHANGE_CONN_PACKET_TYPE    : 0x000F | self.GRP.LINK_CONTROL_CMDS,
	AUTHENTICATION_REQUESTED   : 0x0011 | self.GRP.LINK_CONTROL_CMDS,
	SET_CONN_ENCRYPTION        : 0x0013 | self.GRP.LINK_CONTROL_CMDS,
	CHANGE_CONN_LINK_KEY       : 0x0015 | self.GRP.LINK_CONTROL_CMDS,
	MASTER_LINK_KEY            : 0x0017 | self.GRP.LINK_CONTROL_CMDS,
	RMT_NAME_REQUEST           : 0x0019 | self.GRP.LINK_CONTROL_CMDS,
	RMT_NAME_REQUEST_CANCEL    : 0x001A | self.GRP.LINK_CONTROL_CMDS,
	READ_RMT_FEATURES          : 0x001B | self.GRP.LINK_CONTROL_CMDS,
	READ_RMT_EXT_FEATURES      : 0x001C | self.GRP.LINK_CONTROL_CMDS,
	READ_RMT_VERSION_INFO      : 0x001D | self.GRP.LINK_CONTROL_CMDS,
	READ_RMT_CLOCK_OFFSET      : 0x001F | self.GRP.LINK_CONTROL_CMDS,
	READ_LMP_HANDLE            : 0x0020 | self.GRP.LINK_CONTROL_CMDS,
	SETUP_ESCO_CONNECTION      : 0x0028 | self.GRP.LINK_CONTROL_CMDS,
	ACCEPT_ESCO_CONNECTION     : 0x0029 | self.GRP.LINK_CONTROL_CMDS,
	REJECT_ESCO_CONNECTION     : 0x002A | self.GRP.LINK_CONTROL_CMDS,
	IO_CAPABILITY_RESPONSE     : 0x002B | self.GRP.LINK_CONTROL_CMDS,
	USER_CONF_REQUEST_REPLY    : 0x002C | self.GRP.LINK_CONTROL_CMDS,
	USER_CONF_VALUE_NEG_REPLY  : 0x002D | self.GRP.LINK_CONTROL_CMDS,
	USER_PASSKEY_REQ_REPLY     : 0x002E | self.GRP.LINK_CONTROL_CMDS,
	USER_PASSKEY_REQ_NEG_REPLY : 0x002F | self.GRP.LINK_CONTROL_CMDS,
	REM_OOB_DATA_REQ_REPLY     : 0x0030 | self.GRP.LINK_CONTROL_CMDS,
	REM_OOB_DATA_REQ_NEG_REPLY : 0x0033 | self.GRP.LINK_CONTROL_CMDS,
	IO_CAP_REQ_NEG_REPLY       : 0x0034 | self.GRP.LINK_CONTROL_CMDS,

	// AMP HCI
	CREATE_PHYSICAL_LINK       : 0x0035 | self.GRP.LINK_CONTROL_CMDS,
	ACCEPT_PHYSICAL_LINK       : 0x0036 | self.GRP.LINK_CONTROL_CMDS,
	DISCONNECT_PHYSICAL_LINK   : 0x0037 | self.GRP.LINK_CONTROL_CMDS,
	CREATE_LOGICAL_LINK        : 0x0038 | self.GRP.LINK_CONTROL_CMDS,
	ACCEPT_LOGICAL_LINK        : 0x0039 | self.GRP.LINK_CONTROL_CMDS,
	DISCONNECT_LOGICAL_LINK    : 0x003A | self.GRP.LINK_CONTROL_CMDS,
	LOGICAL_LINK_CANCEL        : 0x003B | self.GRP.LINK_CONTROL_CMDS,
	FLOW_SPEC_MODIFY           : 0x003C | self.GRP.LINK_CONTROL_CMDS,
	ENH_SETUP_ESCO_CONNECTION  : 0x003D | self.GRP.LINK_CONTROL_CMDS,
	ENH_ACCEPT_ESCO_CONNECTION : 0x003E | self.GRP.LINK_CONTROL_CMDS,

	// ConnectionLess Broadcast
	TRUNCATED_PAGE             : 0x003F | self.GRP.LINK_CONTROL_CMDS,
	TRUNCATED_PAGE_CANCEL      : 0x0040 | self.GRP.LINK_CONTROL_CMDS,
	SET_CLB                    : 0x0041 | self.GRP.LINK_CONTROL_CMDS,
	RECEIVE_CLB                : 0x0042 | self.GRP.LINK_CONTROL_CMDS,
	START_SYNC_TRAIN           : 0x0043 | self.GRP.LINK_CONTROL_CMDS,
	RECEIVE_SYNC_TRAIN         : 0x0044 | self.GRP.LINK_CONTROL_CMDS
};

/**
 * Definitions for Link policy commands
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
this.GRP.LINK.POLICY = {
	HOLD_MODE                  : 0x0001 | self.GRP.LINK_POLICY_CMDS,
	SNIFF_MODE                 : 0x0003 | self.GRP.LINK_POLICY_CMDS,
	EXIT_SNIFF_MODE            : 0x0004 | self.GRP.LINK_POLICY_CMDS,
	PARK_MODE                  : 0x0005 | self.GRP.LINK_POLICY_CMDS,
	EXIT_PARK_MODE             : 0x0006 | self.GRP.LINK_POLICY_CMDS,
	QOS_SETUP                  : 0x0007 | self.GRP.LINK_POLICY_CMDS,
	ROLE_DISCOVERY             : 0x0009 | self.GRP.LINK_POLICY_CMDS,
	SWITCH_ROLE                : 0x000B | self.GRP.LINK_POLICY_CMDS,
	READ_POLICY_SETTINGS       : 0x000C | self.GRP.LINK_POLICY_CMDS,
	WRITE_POLICY_SETTINGS      : 0x000D | self.GRP.LINK_POLICY_CMDS,
	READ_DEF_POLICY_SETTINGS   : 0x000E | self.GRP.LINK_POLICY_CMDS,
	WRITE_DEF_POLICY_SETTINGS  : 0x000F | self.GRP.LINK_POLICY_CMDS,
	FLOW_SPECIFICATION         : 0x0010 | self.GRP.LINK_POLICY_CMDS,
	SNIFF_SUB_RATE             : 0x0011 | self.GRP.LINK_POLICY_CMDS
};

/**
 * Definitions for Host cont baseband commands
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
this.GRP.HOST.BASE = {
	SET_EVENT_MASK              : 0x0001 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	RESET                       : 0x0003 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	SET_EVENT_FILTER            : 0x0005 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	FLUSH                       : 0x0008 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_PIN_TYPE               : 0x0009 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_PIN_TYPE              : 0x000A | self.GRP.HOST_CONT_BASEBAND_CMDS,
	CREATE_NEW_UNIT_KEY         : 0x000B | self.GRP.HOST_CONT_BASEBAND_CMDS,
	GET_MWS_TRANS_LAYER_CFG     : 0x000C | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_STORED_LINK_KEY        : 0x000D | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_STORED_LINK_KEY       : 0x0011 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	DELETE_STORED_LINK_KEY      : 0x0012 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	CHANGE_LOCAL_NAME           : 0x0013 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_LOCAL_NAME             : 0x0014 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_CONN_ACCEPT_TOUT       : 0x0015 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_CONN_ACCEPT_TOUT      : 0x0016 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_PAGE_TOUT              : 0x0017 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_PAGE_TOUT             : 0x0018 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_SCAN_ENABLE            : 0x0019 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_SCAN_ENABLE           : 0x001A | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_PAGESCAN_CFG           : 0x001B | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_PAGESCAN_CFG          : 0x001C | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_INQUIRYSCAN_CFG        : 0x001D | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_INQUIRYSCAN_CFG       : 0x001E | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_AUTHENTICATION_ENABLE  : 0x001F | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_AUTHENTICATION_ENABLE : 0x0020 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_ENCRYPTION_MODE        : 0x0021 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_ENCRYPTION_MODE       : 0x0022 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_CLASS_OF_DEVICE        : 0x0023 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_CLASS_OF_DEVICE       : 0x0024 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_VOICE_SETTINGS         : 0x0025 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_VOICE_SETTINGS        : 0x0026 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_AUTO_FLUSH_TOUT        : 0x0027 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_AUTO_FLUSH_TOUT       : 0x0028 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_NUM_BCAST_REXMITS      : 0x0029 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_NUM_BCAST_REXMITS     : 0x002A | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_HOLD_MODE_ACTIVITY     : 0x002B | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_HOLD_MODE_ACTIVITY    : 0x002C | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_TRANSMIT_POWER_LEVEL   : 0x002D | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_SCO_FLOW_CTRL_ENABLE   : 0x002E | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_SCO_FLOW_CTRL_ENABLE  : 0x002F | self.GRP.HOST_CONT_BASEBAND_CMDS,
	SET_HC_TO_HOST_FLOW_CTRL    : 0x0031 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	HOST_BUFFER_SIZE            : 0x0033 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	HOST_NUM_PACKETS_DONE       : 0x0035 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_LINK_SUPER_TOUT        : 0x0036 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_LINK_SUPER_TOUT       : 0x0037 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_NUM_SUPPORTED_IAC      : 0x0038 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_CURRENT_IAC_LAP        : 0x0039 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_CURRENT_IAC_LAP       : 0x003A | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_PAGESCAN_PERIOD_MODE   : 0x003B | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_PAGESCAN_PERIOD_MODE  : 0x003C | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_PAGESCAN_MODE          : 0x003D | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_PAGESCAN_MODE         : 0x003E | self.GRP.HOST_CONT_BASEBAND_CMDS,
	SET_AFH_CHANNELS            : 0x003F | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_INQSCAN_TYPE           : 0x0042 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_INQSCAN_TYPE          : 0x0043 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_INQUIRY_MODE           : 0x0044 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_INQUIRY_MODE          : 0x0045 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_PAGESCAN_TYPE          : 0x0046 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_PAGESCAN_TYPE         : 0x0047 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_AFH_ASSESSMENT_MODE    : 0x0048 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_AFH_ASSESSMENT_MODE   : 0x0049 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_EXT_INQ_RESPONSE       : 0x0051 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_EXT_INQ_RESPONSE      : 0x0052 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	REFRESH_ENCRYPTION_KEY      : 0x0053 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_SIMPLE_PAIRING_MODE    : 0x0055 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_SIMPLE_PAIRING_MODE   : 0x0056 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_LOCAL_OOB_DATA         : 0x0057 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_INQ_TX_POWER_LEVEL     : 0x0058 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_INQ_TX_POWER_LEVEL    : 0x0059 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_ERRONEOUS_DATA_RPT     : 0x005A | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_ERRONEOUS_DATA_RPT    : 0x005B | self.GRP.HOST_CONT_BASEBAND_CMDS,
	ENHANCED_FLUSH              : 0x005F | self.GRP.HOST_CONT_BASEBAND_CMDS,
	SEND_KEYPRESS_NOTIF         : 0x0060 | self.GRP.HOST_CONT_BASEBAND_CMDS,

	// AMP HCI
	READ_LOGICAL_LINK_ACCEPT_TIMEOUT  : 0x0061 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_LOGICAL_LINK_ACCEPT_TIMEOUT : 0x0062 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	SET_EVENT_MASK_PAGE_2             : 0x0063 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_LOCATION_DATA                : 0x0064 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_LOCATION_DATA               : 0x0065 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_FLOW_CONTROL_MODE            : 0x0066 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_FLOW_CONTROL_MODE           : 0x0067 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_BE_FLUSH_TOUT                : 0x0069 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_BE_FLUSH_TOUT               : 0x006A | self.GRP.HOST_CONT_BASEBAND_CMDS,
	SHORT_RANGE_MODE                  : 0x006B | self.GRP.HOST_CONT_BASEBAND_CMDS, // 802.11 only
	READ_LE_HOST_SUPPORTED            : 0x006C | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_LE_HOST_SUPPORTED           : 0x006D | self.GRP.HOST_CONT_BASEBAND_CMDS,

	// MWS coexistence
	SET_MWS_CHANNEL_PARAMETERS        : 0x006E | self.GRP.HOST_CONT_BASEBAND_CMDS,
	SET_EXTERNAL_FRAME_CONFIGURATION  : 0x006F | self.GRP.HOST_CONT_BASEBAND_CMDS,
	SET_MWS_SIGNALING                 : 0x0070 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	SET_MWS_TRANSPORT_LAYER           : 0x0071 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	SET_MWS_SCAN_FREQUENCY_TABLE      : 0x0072 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	SET_MWS_PATTERN_CONFIGURATION     : 0x0073 | self.GRP.HOST_CONT_BASEBAND_CMDS,

	// ConnectionLess Broadcast
	SET_RESERVED_LT_ADDR              : 0x0074 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	DELETE_RESERVED_LT_ADDR           : 0x0075 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_CLB_DATA                    : 0x0076 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	READ_SYNC_TRAIN_PARAM             : 0x0077 | self.GRP.HOST_CONT_BASEBAND_CMDS,
	WRITE_SYNC_TRAIN_PARAM            : 0x0078 | self.GRP.HOST_CONT_BASEBAND_CMDS
};

/**
 * Definitions for informational parameters
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
this.GRP.INFO = {
	READ_LOCAL_VERSION_INFO     : 0x0001 | self.GRP.INFORMATIONAL_PARAMS,
	READ_LOCAL_SUPPORTED_CMDS   : 0x0002 | self.GRP.INFORMATIONAL_PARAMS,
	READ_LOCAL_FEATURES         : 0x0003 | self.GRP.INFORMATIONAL_PARAMS,
	READ_LOCAL_EXT_FEATURES     : 0x0004 | self.GRP.INFORMATIONAL_PARAMS,
	READ_BUFFER_SIZE            : 0x0005 | self.GRP.INFORMATIONAL_PARAMS,
	READ_COUNTRY_CODE           : 0x0007 | self.GRP.INFORMATIONAL_PARAMS,
	READ_BD_ADDR                : 0x0009 | self.GRP.INFORMATIONAL_PARAMS,
	READ_DATA_BLOCK_SIZE        : 0x000A | self.GRP.INFORMATIONAL_PARAMS,
	READ_LOCAL_SUPPORTED_CODECS : 0x000B | self.GRP.INFORMATIONAL_PARAMS
};

/**
 * Definitions for status parameters
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
this.GRP.STATUS = {
	READ_FAILED_CONTACT_COUNT   : 0x0001 | self.GRP.STATUS_PARAMS,
	RESET_FAILED_CONTACT_COUNT  : 0x0002 | self.GRP.STATUS_PARAMS,
	GET_LINK_QUALITY            : 0x0003 | self.GRP.STATUS_PARAMS,
	READ_RSSI                   : 0x0005 | self.GRP.STATUS_PARAMS,
	READ_AFH_CH_MAP             : 0x0006 | self.GRP.STATUS_PARAMS,
	READ_CLOCK                  : 0x0007 | self.GRP.STATUS_PARAMS,
	READ_ENCR_KEY_SIZE          : 0x0008 | self.GRP.STATUS_PARAMS,

	// AMP HCI
	READ_LOCAL_AMP_INFO         : 0x0009 | self.GRP.STATUS_PARAMS,
	READ_LOCAL_AMP_ASSOC        : 0x000A | self.GRP.STATUS_PARAMS,
	WRITE_REMOTE_AMP_ASSOC      : 0x000B | self.GRP.STATUS_PARAMS
};

/**
 * Definitions for testing commands
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
this.GRP.TEST = {
	READ_LOOPBACK_MODE          : 0x0001 | self.GRP.TESTING_CMDS,
	WRITE_LOOPBACK_MODE         : 0x0002 | self.GRP.TESTING_CMDS,
	ENABLE_DEV_UNDER_TEST_MODE  : 0x0003 | self.GRP.TESTING_CMDS,
	WRITE_SIMP_PAIR_DEBUG_MODE  : 0x0004 | self.GRP.TESTING_CMDS,

	// AMP HCI
	ENABLE_AMP_RCVR_REPORTS     : 0x0007 | self.GRP.TESTING_CMDS,
	AMP_TEST_END                : 0x0008 | self.GRP.TESTING_CMDS,
	AMP_TEST                    : 0x0009 | self.GRP.TESTING_CMDS
};

/**
 * Definitions for BLE controller setup and configuration commands
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
this.BLE = {
	SET_EVENT_MASK          : 0x0001 | self.GRP.BLE_CMDS,
	READ_BUFFER_SIZE        : 0x0002 | self.GRP.BLE_CMDS,
	READ_LOCAL_SPT_FEAT     : 0x0003 | self.GRP.BLE_CMDS,
	WRITE_LOCAL_SPT_FEAT    : 0x0004 | self.GRP.BLE_CMDS,
	WRITE_RANDOM_ADDR       : 0x0005 | self.GRP.BLE_CMDS,
	WRITE_ADV_PARAMS        : 0x0006 | self.GRP.BLE_CMDS,
	READ_ADV_CHNL_TX_POWER  : 0x0007 | self.GRP.BLE_CMDS,
	WRITE_ADV_DATA          : 0x0008 | self.GRP.BLE_CMDS,
	WRITE_SCAN_RSP_DATA     : 0x0009 | self.GRP.BLE_CMDS,
	WRITE_ADV_ENABLE        : 0x000A | self.GRP.BLE_CMDS,
	WRITE_SCAN_PARAMS       : 0x000B | self.GRP.BLE_CMDS,
	WRITE_SCAN_ENABLE       : 0x000C | self.GRP.BLE_CMDS,
	CREATE_CONN             : 0x000D | self.GRP.BLE_CMDS,
	CREATE_CONN_CANCEL      : 0x000E | self.GRP.BLE_CMDS,
	READ_WHITE_LIST_SIZE    : 0x000F | self.GRP.BLE_CMDS,
	CLEAR_WHITE_LIST        : 0x0010 | self.GRP.BLE_CMDS,
	ADD_WHITE_LIST          : 0x0011 | self.GRP.BLE_CMDS,
	REMOVE_WHITE_LIST       : 0x0012 | self.GRP.BLE_CMDS,
	UPD_LL_CONN_PARAMS      : 0x0013 | self.GRP.BLE_CMDS,
	SET_HOST_CHNL_CLASS     : 0x0014 | self.GRP.BLE_CMDS,
	READ_CHNL_MAP           : 0x0015 | self.GRP.BLE_CMDS,
	READ_REMOTE_FEAT        : 0x0016 | self.GRP.BLE_CMDS,
	ENCRYPT                 : 0x0017 | self.GRP.BLE_CMDS,
	RAND                    : 0x0018 | self.GRP.BLE_CMDS,
	START_ENC               : 0x0019 | self.GRP.BLE_CMDS,
	LTK_REQ_REPLY           : 0x001A | self.GRP.BLE_CMDS,
	LTK_REQ_NEG_REPLY       : 0x001B | self.GRP.BLE_CMDS,
	READ_SUPPORTED_STATES   : 0x001C | self.GRP.BLE_CMDS,
	// 0x001D, 0x001E and 0x001F are reserved

	RC_PARAM_REQ_REPLY      : 0x0020 | self.GRP.BLE_CMDS,
	RC_PARAM_REQ_NEG_REPLY  : 0x0021 | self.GRP.BLE_CMDS,

	// BLE TEST COMMANDS
	RECEIVER_TEST           : 0x001D | self.GRP.BLE_CMDS,
	TRANSMITTER_TEST        : 0x001E | self.GRP.BLE_CMDS,
	TEST_END                : 0x001F | self.GRP.BLE_CMDS,

	// Vendor specific things
	VENDOR_CAP_OCF          : 0x0153 | self.GRP.VENDOR_SPECIFIC, // LE Get Vendor Capabilities Command OCF
	MULTI_ADV_OCF           : 0x0154 | self.GRP.VENDOR_SPECIFIC, // Multi adv OCF
	BATCH_SCAN_OCF          : 0x0156 | self.GRP.VENDOR_SPECIFIC, // Batch scan OCF
	ADV_FILTER_OCF          : 0x0157 | self.GRP.VENDOR_SPECIFIC, // ADV filter OCF
	TRACK_ADV_OCF           : 0x0158 | self.GRP.VENDOR_SPECIFIC, // Tracking OCF
	ENERGY_INFO_OCF         : 0x0159 | self.GRP.VENDOR_SPECIFIC, // Energy info OCF

	// Events
	THRESHOLD_SUB_EVT       : 0x54, // Threshold event
	TRACKING_SUB_EVT        : 0x56  // Tracking event
};

/**
 * Definitions for advanced BLE features
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
this.BLE.ADV = {
	SET_PARAM                    : 0x01,
	WRITE_ADV_DATA               : 0x02,
	WRITE_SCAN_RSP_DATA          : 0x03,
	SET_RANDOM_ADDR              : 0x04,
	ENB                          : 0x05,
	ST_CHG                       : 0x55  // Multi adv instance state change
};

/**
 * Definitions for BLE batch scans
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
this.BLE.BATCH = {
	SCAN_ENB_DISAB_CUST_FEATURE      : 0x01,
	SCAN_SET_STORAGE_PARAM           : 0x02,
	SCAN_SET_PARAMS                  : 0x03,
	SCAN_READ_RESULTS                : 0x04,
	THRESHOLD_SUB_EVT                : 0x54, // Threshold event
	TRACKING_SUB_EVT                 : 0x56  // Tracking event
};

/**
 * Definitions for BLE states
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
this.BLE.STATES = {
	ADV         : 0x00000001,
	SCAN        : 0x00000002,
	INIT        : 0x00000004,
	CONN_SL     : 0x00000008,
	ADV_SCAN    : 0x00000010,
	ADV_INIT    : 0x00000020,
	ADV_MA      : 0x00000040,
	ADV_SL      : 0x00000080,
	SCAN_INIT   : 0x00000100,
	SCAN_MA     : 0x00000200,
	SCAN_SL     : 0x00000400,
	INIT_MA     : 0x00000800
};

/**
 * Definitions for BLE event subcodes
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
this.BLE.EVENT = {
	CONN_COMPLETE_EVT           : 0x01,
	ADV_PKT_RPT_EVT             : 0x02,
	LL_CONN_PARAM_UPD_EVT       : 0x03,
	READ_REMOTE_FEAT_CMPL_EVT   : 0x04,
	LTK_REQ_EVT                 : 0x05,
	RC_PARAM_REQ_EVT            : 0x06
};

/**
 * Definitions for events
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
this.EVENT = {
	INQUIRY_COMP                    : 0x01,
	INQUIRY_RESULT                  : 0x02,
	CONNECTION_COMP                 : 0x03,
	CONNECTION_REQUEST              : 0x04,
	DISCONNECTION_COMP              : 0x05,
	AUTHENTICATION_COMP             : 0x06,
	RMT_NAME_REQUEST_COMP           : 0x07,
	ENCRYPTION_CHANGE               : 0x08,
	CHANGE_CONN_LINK_KEY            : 0x09,
	MASTER_LINK_KEY_COMP            : 0x0A,
	READ_RMT_FEATURES_COMP          : 0x0B,
	READ_RMT_VERSION_COMP           : 0x0C,
	QOS_SETUP_COMP                  : 0x0D,
	COMMAND_COMPLETE                : 0x0E,
	COMMAND_STATUS                  : 0x0F,
	HARDWARE_ERROR                  : 0x10,
	FLUSH_OCCURED                   : 0x11,
	ROLE_CHANGE                     : 0x12,
	NUM_COMPL_DATA_PKTS             : 0x13,
	MODE_CHANGE                     : 0x14,
	RETURN_LINK_KEYS                : 0x15,
	PIN_CODE_REQUEST                : 0x16,
	LINK_KEY_REQUEST                : 0x17,
	LINK_KEY_NOTIFICATION           : 0x18,
	LOOPBACK_COMMAND                : 0x19,
	DATA_BUF_OVERFLOW               : 0x1A,
	MAX_SLOTS_CHANGED               : 0x1B,
	READ_CLOCK_OFF_COMP             : 0x1C,
	CONN_PKT_TYPE_CHANGE            : 0x1D,
	QOS_VIOLATION                   : 0x1E,
	PAGE_SCAN_MODE_CHANGE           : 0x1F,
	PAGE_SCAN_REP_MODE_CHNG         : 0x20,
	FLOW_SPECIFICATION_COMP         : 0x21,
	INQUIRY_RSSI_RESULT             : 0x22,
	READ_RMT_EXT_FEATURES_COMP      : 0x23,
	ESCO_CONNECTION_COMP            : 0x2C,
	ESCO_CONNECTION_CHANGED         : 0x2D,
	SNIFF_SUB_RATE                  : 0x2E,
	EXTENDED_INQUIRY_RESULT         : 0x2F,
	ENCRYPTION_KEY_REFRESH_COMP     : 0x30,
	IO_CAPABILITY_REQUEST           : 0x31,
	IO_CAPABILITY_RESPONSE          : 0x32,
	USER_CONFIRMATION_REQUEST       : 0x33,
	USER_PASSKEY_REQUEST            : 0x34,
	REMOTE_OOB_DATA_REQUEST         : 0x35,
	SIMPLE_PAIRING_COMPLETE         : 0x36,
	LINK_SUPER_TOUT_CHANGED         : 0x38,
	ENHANCED_FLUSH_COMPLETE         : 0x39,
	USER_PASSKEY_NOTIFY             : 0x3B,
	KEYPRESS_NOTIFY                 : 0x3C,
	RMT_HOST_SUP_FEAT_NOTIFY        : 0x3D,
	PHYSICAL_LINK_COMP              : 0x40,
	CHANNEL_SELECTED                : 0x41,
	DISC_PHYSICAL_LINK_COMP         : 0x42,
	PHY_LINK_LOSS_EARLY_WARNING     : 0x43,
	PHY_LINK_RECOVERY               : 0x44,
	LOGICAL_LINK_COMP               : 0x45,
	DISC_LOGICAL_LINK_COMP          : 0x46,
	FLOW_SPEC_MODIFY_COMP           : 0x47,
	NUM_COMPL_DATA_BLOCKS           : 0x48,
	SHORT_RANGE_MODE_COMPLETE       : 0x4C,
	AMP_STATUS_CHANGE               : 0x4D,
	SET_TRIGGERED_CLOCK_CAPTURE     : 0x4E,

	// ULP HCI Event
	BLE_EVENT                       : 0x03E
};

/**
 * Definitions for error codes
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
this.ERROR = {
	SUCCESS                                 : 0x00,
	PENDING                                 : 0x00,
	ILLEGAL_COMMAND                         : 0x01,
	NO_CONNECTION                           : 0x02,
	HW_FAILURE                              : 0x03,
	PAGE_TIMEOUT                            : 0x04,
	AUTH_FAILURE                            : 0x05,
	KEY_MISSING                             : 0x06,
	MEMORY_FULL                             : 0x07,
	CONNECTION_TOUT                         : 0x08,
	MAX_NUM_OF_CONNECTIONS                  : 0x09,
	MAX_NUM_OF_SCOS                         : 0x0A,
	CONNECTION_EXISTS                       : 0x0B,
	COMMAND_DISALLOWED                      : 0x0C,
	HOST_REJECT_RESOURCES                   : 0x0D,
	HOST_REJECT_SECURITY                    : 0x0E,
	HOST_REJECT_DEVICE                      : 0x0F,
	HOST_TIMEOUT                            : 0x10,
	UNSUPPORTED_VALUE                       : 0x11,
	ILLEGAL_PARAMETER_FMT                   : 0x12,
	PEER_USER                               : 0x13,
	PEER_LOW_RESOURCES                      : 0x14,
	PEER_POWER_OFF                          : 0x15,
	CONN_CAUSE_LOCAL_HOST                   : 0x16,
	REPEATED_ATTEMPTS                       : 0x17,
	PAIRING_NOT_ALLOWED                     : 0x18,
	UNKNOWN_LMP_PDU                         : 0x19,
	UNSUPPORTED_REM_FEATURE                 : 0x1A,
	SCO_OFFSET_REJECTED                     : 0x1B,
	SCO_INTERVAL_REJECTED                   : 0x1C,
	SCO_AIR_MODE                            : 0x1D,
	INVALID_LMP_PARAM                       : 0x1E,
	UNSPECIFIED                             : 0x1F,
	UNSUPPORTED_LMP_FEATURE                 : 0x20,
	ROLE_CHANGE_NOT_ALLOWED                 : 0x21,
	LMP_RESPONSE_TIMEOUT                    : 0x22,
	LMP_ERR_TRANS_COLLISION                 : 0x23,
	LMP_PDU_NOT_ALLOWED                     : 0x24,
	ENCRY_MODE_NOT_ACCEPTABLE               : 0x25,
	UNIT_KEY_USED                           : 0x26,
	QOS_NOT_SUPPORTED                       : 0x27,
	INSTANT_PASSED                          : 0x28,
	PAIRING_WITH_UNIT_KEY_NOT_SUPPORTED     : 0x29,
	DIFF_TRANSACTION_COLLISION              : 0x2A,
	UNDEFINED_0x2B                          : 0x2B,
	QOS_UNACCEPTABLE_PARAM                  : 0x2C,
	QOS_REJECTED                            : 0x2D,
	CHAN_CLASSIF_NOT_SUPPORTED              : 0x2E,
	INSUFFCIENT_SECURITY                    : 0x2F,
	PARAM_OUT_OF_RANGE                      : 0x30,
	UNDEFINED_0x31                          : 0x31,
	ROLE_SWITCH_PENDING                     : 0x32,
	UNDEFINED_0x33                          : 0x33,
	RESERVED_SLOT_VIOLATION                 : 0x34,
	ROLE_SWITCH_FAILED                      : 0x35,
	INQ_RSP_DATA_TOO_LARGE                  : 0x36,
	SIMPLE_PAIRING_NOT_SUPPORTED            : 0x37,
	HOST_BUSY_PAIRING                       : 0x38,
	REJ_NO_SUITABLE_CHANNEL                 : 0x39,
	CONTROLLER_BUSY                         : 0x3A,
	UNACCEPT_CONN_INTERVAL                  : 0x3B,
	DIRECTED_ADVERTISING_TIMEOUT            : 0x3C,
	CONN_TOUT_DUE_TO_MIC_FAILURE            : 0x3D,
	CONN_FAILED_ESTABLISHMENT               : 0x3E,
	MAC_CONNECTION_FAILED                   : 0x3F,

	// ConnectionLess Broadcast errors
	LT_ADDR_ALREADY_IN_USE                  : 0x40,
	LT_ADDR_NOT_ALLOCATED                   : 0x41,
	CLB_NOT_ENABLED                         : 0x42,
	CLB_DATA_TOO_BIG                        : 0x43,
	MAX_ERR                                 : 0x43,
	HINT_TO_RECREATE_AMP_PHYS_LINK          : 0xFF
};

/**
 * Packet definitions
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
this.PKT = {};

/**
 * Packet types (in packet header)
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
this.PKT.TYPE = {
	NULL   : 0x00,
	POLL   : 0x01,
	FHS    : 0x02,
	DM1    : 0x03,
	DH1    : 0x04,
	HV1    : 0x05,
	HV2    : 0x06,
	HV3    : 0x07,
	DV     : 0x08,
	AUX1   : 0x09,
	DM3    : 0x0a,
	DH3    : 0x0b,
	DM5    : 0x0e,
	DH5    : 0x0f,
	ID     : 0x10, // Internally used packet types
	BAD    : 0x11,
	NONE   : 0x12
};

/**
 * Packet sizes
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
this.PKT.SIZE = {
	DM1         : 17,
	DH1         : 27,
	DM3         : 121,
	DH3         : 183,
	DM5         : 224,
	DH5         : 339,
	AUX1        : 29,
	HV1         : 10,
	HV2         : 20,
	HV3         : 30,
	DV          : 9,
	EDR2_DH1    : 54,
	EDR2_DH3    : 367,
	EDR2_DH5    : 679,
	EDR3_DH1    : 83,
	EDR3_DH3    : 552,
	EDR3_DH5    : 1021
};

/**
 * Company ids (from Bluetooth Assigned Numbers v1.1, section 2.2)
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
this.COMPANY = {
	ERICSSON             : 0,
	NOKIA                : 1,
	INTEL                : 2,
	IBM                  : 3,
	TOSHIBA              : 4,
	'3COM'               : 5,
	MICROSOFT            : 6,
	LUCENT               : 7,
	MOTOROLA             : 8,
	INFINEON             : 9,
	CSR                  : 10,
	SILICON_WAVE         : 11,
	DIGIANSWER           : 12,
	TEXAS_INSTRUMENTS    : 13,
	PARTHUS              : 14,
	BROADCOM             : 15,
	MITEL_SEMI           : 16,
	WIDCOMM              : 17,
	ZEEVO                : 18,
	ATMEL                : 19,
	MITSUBISHI           : 20,
	RTX_TELECOM          : 21,
	KC_TECH              : 22,
	NEWLOGIC             : 23,
	TRANSILICA           : 24,
	ROHDE_SCHWARZ        : 25,
	TTPCOM               : 26,
	SIGNIA               : 27,
	CONEXANT             : 28,
	QUALCOMM             : 29,
	INVENTEL             : 30,
	AVM                  : 31,
	BANDSPEED            : 32,
	MANSELLA             : 33,
	NEC_CORP             : 34,
	WAVEPLUS             : 35,
	ALCATEL              : 36,
	PHILIPS              : 37,
	C_TECHNOLOGIES       : 38,
	OPEN_INTERFACE       : 39,
	RF_MICRO             : 40,
	HITACHI              : 41,
	SYMBOL_TECH          : 42,
	TENOVIS              : 43,
	MACRONIX             : 44,
	GCT_SEMI             : 45,
	NORWOOD_SYSTEMS      : 46,
	MEWTEL_TECH          : 47,
	STM                  : 48,
	SYNOPSYS             : 49,
	RED_M_LTD            : 50,
	COMMIL_LTD           : 51,
	CATC                 : 52,
	ECLIPSE              : 53,
	RENESAS_TECH         : 54,
	MOBILIAN_CORP        : 55,
	TERAX                : 56,
	ISSC                 : 57,
	MATSUSHITA           : 58,
	GENNUM_CORP          : 59,
	RESEARCH_IN_MOTION   : 60,
	IPEXTREME            : 61,
	SYSTEMS_AND_CHIPS    : 62,
	BLUETOOTH_SIG        : 63,
	SEIKO_EPSON_CORP     : 64,
	ISS_TAIWAN           : 65,
	CONWISE_TECHNOLOGIES : 66,
	PARROT_SA            : 67,
	SOCKET_COMM          : 68,
	ALTHEROS             : 69,
	MEDIATEK             : 70,
	BLUEGIGA             : 71,
	MARVELL              : 72,
	'3DSP_CORP'          : 73,
	ACCEL_SEMICONDUCTOR  : 74,
	CONTINENTAL_AUTO     : 75,
	APPLE                : 76,
	STACCATO             : 77,
	AVAGO_TECHNOLOGIES   : 78,
	APT_LTD              : 79,
	SIRF_TECHNOLOGY      : 80,
	TZERO_TECHNOLOGY     : 81,
	J_AND_M_CORP         : 82,
	FREE_2_MOVE          : 83,
	'3DIJOY_CORP'        : 84,
	PLANTRONICS          : 85,
	SONY_ERICSSON_MOBILE : 86,
	HARMON_INTL_IND      : 87,
	VIZIO                : 88,
	NORDIC_SEMI          : 89,
	EM_MICRO             : 90,
	RALINK_TECH          : 91,
	BELKIN_INC           : 92,
	REALTEK_SEMI         : 93,
	STONESTREET_ONE      : 94,
	WICENTRIC            : 95,
	RIVIERAWAVES         : 96,
	RDA_MICRO            : 97,
	GIBSON_GUITARS       : 98,
	MICOMMAND_INC        : 99,
	BAND_XI              : 100,
	HP_COMPANY           : 101,
	'9SOLUTIONS_OY'      : 102,
	GN_NETCOM            : 103,
	GENERAL_MOTORS       : 104,
	AD_ENGINEERING       : 105,
	MINDTREE_LTD         : 106,
	POLAR_ELECTRO        : 107,
	BEAUTIFUL_ENTERPRISE : 108,
	BRIARTEK             : 109,
	SUMMIT_DATA_COMM     : 110,
	SOUND_ID             : 111,
	MONSTER_LLC          : 112,
	CONNECTBLU           : 113,
	SHANGHAI_SSE         : 114,
	GROUP_SENSE          : 115,
	ZOMM                 : 116,
	SAMSUNG              : 117,
	CREATIVE_TECH        : 118,
	LAIRD_TECH           : 119,
	NIKE                 : 120,
	LESSWIRE             : 121,
	MSTAR_SEMI           : 122,
	HANLYNN_TECH         : 123,
	AR_CAMBRIDGE         : 124,
	SEERS_TECH           : 125,
	SPORTS_TRACKING      : 126,
	AUTONET_MOBILE       : 127,
	DELORME_PUBLISH      : 128,
	WUXI_VIMICRO         : 129,
	SENNHEISER           : 130,
	TIME_KEEPING_SYS     : 131,
	LUDUS_HELSINKI       : 132,
	BLUE_RADIOS          : 133,
	EQUINUX              : 134,
	GARMIN_INTL          : 135,
	ECOTEST              : 136,
	GN_RESOUND           : 137,
	JAWBONE              : 138,
	TOPCON_POSITIONING   : 139,
	QUALCOMM_LABS        : 140,
	ZSCAN_SOFTWARE       : 141,
	QUINTIC              : 142,
	STOLLMAN_EV          : 143,
	FUNAI_ELECTRONIC     : 144,
	ADV_PANMOBILE        : 145,
	THINK_OPTICS         : 146,
	UNIVERSAL_ELEC       : 147,
	AIROHA_TECH          : 148,
	MAX_ID               : 149, // this is a place holder
	INTERNAL             : 65535,
};

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
function reverseLookup(id) {

	var result,
	    temp,
	    key;

	for (key in this) {
		if (this[key] === id) {
			return key;
		}
	}

	// Nothing found? Look deeper
	for (key in this) {

		// Skip company, try it last
		if (key == 'COMPANY') {
			continue;
		}

		if (this[key] && typeof this[key] == 'object' && this[key].reverseLookup) {
			temp = this[key].reverseLookup(id);

			if (temp) {
				result = key + '.' + temp;
			}
		}
	}

	return result;
}

/**
 * Identify a number
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}   id
 * @param    {Boolean}  show_id   True by default
 *
 * @return   {String}
 */
function identify(id, show_id) {

	var name = this.reverseLookup(id),
	    result;

	if (name) {
		result = name;
	} else {
		result = '_unknown_';

		// If show id is false, add it anyway,
		// because the name was not found
		if (!show_id) {
			result += id;
		}
	}

	if (show_id) {
		result += ' (' + id + ')';
	}

	return result;
}

/**
 * Add the given function to this object and all the underlying ones
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
function addFunction(obj, fnc) {

	var key;

	// Store it on the object itself
	obj[fnc.name] = fnc;

	// Look for sub objects
	for (key in obj) {
		// @TODO: add checks for regular prototype?
		if (obj[key] && typeof obj[key] == 'object') {
			addFunction(obj[key], fnc);
		}
	}
}

// Add the functions
addFunction(this, reverseLookup);
addFunction(this, identify);