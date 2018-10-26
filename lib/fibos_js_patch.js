var FIBOS = require('fibos.js');

Object.assign(FIBOS.modules.json.schema, {
	setstake: {
		"base": "",
		"action": {
			"name": "setstake",
			"account": "eosio"
		},
		"fields": {
			"stake": "int64"
		}
	},
	setramrate: {
		"base": "",
		"action": {
			"name": "setramrate",
			"account": "eosio"
		},
		"fields": {
			"bytes_per_block": "int64"
		}	
	}
});

module.exports = FIBOS;