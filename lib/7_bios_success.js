var test = require('test');
var fs = require('fs');
var coroutine = require('coroutine');
var FIBOS = require('./fibos_js_patch.js');
var config = require('../config.json');

test.setup();

describe('FIBOS BIOS SUCCESS', () => {
	var fibos;
	var contracts_path = config["contracts_path"];
	before(function() {
		fibos = FIBOS({
			chainId: config["chainId"],
			keyProvider: config["private_key"],
			httpEndpoint: config["bp_httpEndpoint"],
			logger: {
				log: null,
				error: null
			}
		});

	});

	after(function() {});

	it('install eosio.system', () => {

		let abi = JSON.parse(fs.readFile(contracts_path + 'eosio.system/eosio.system.abi'))
		fibos.setabiSync("eosio", abi, {
			authorization: "eosio"
		});

		fibos.setcodeSync("eosio", 0, 0, fs.readFile(contracts_path + 'eosio.system/eosio.system.wasm'), {
			authorization: "eosio"
		});

		var c = fibos.getCodeSync("eosio", true);
		assert.notEqual(c.code_hash, "0000000000000000000000000000000000000000000000000000000000000000");
		var c = fibos.getAbiSync("eosio")
		assert.isNotNull(c.abi);
	});



	it('eosio updateauth to eosio.prods', () => {

		var r = fibos.getAccountSync('eosio');
		assert.equal(r.permissions[0].perm_name, "active");
		assert.equal(r.permissions[0].parent, "owner");
		assert.equal(r.permissions[0].required_auth.threshold, 1);
		assert.equal(r.permissions[0].required_auth.keys.length, 1);
		assert.deepEqual(r.permissions[0].required_auth.accounts, []);
		assert.deepEqual(r.permissions[0].required_auth.waits, []);

		assert.equal(r.permissions[1].perm_name, "owner");
		assert.equal(r.permissions[1].parent, "");
		assert.equal(r.permissions[1].required_auth.threshold, 1);
		assert.equal(r.permissions[1].required_auth.keys.length, 1);
		assert.deepEqual(r.permissions[1].required_auth.accounts, []);
		assert.deepEqual(r.permissions[1].required_auth.waits, []);

		let ctx = fibos.contractSync("eosio");

		ctx.updateauthSync({
			account: "eosio",
			permission: "active",
			parent: 'owner',
			auth: {
				threshold: 1,
				keys: [],
				accounts: [{
					permission: {
						actor: 'eosio.prods',
						permission: 'active'
					},
					weight: 1,
				}],
				waits: []
			}
		}, {
			authorization: "eosio@owner"
		});

		ctx.updateauthSync({
			account: "eosio",
			permission: "owner",
			parent: '',
			auth: {
				threshold: 1,
				keys: [],
				waits: [],
				accounts: [{
					weight: 1,
					permission: {
						actor: 'eosio.prods',
						permission: 'active'
					}
				}]
			}
		}, {
			authorization: "eosio@owner"
		});
		var r = fibos.getAccountSync('eosio');
		assert.equal(r.permissions[0].perm_name, "active");
		assert.equal(r.permissions[0].parent, "owner");
		assert.equal(r.permissions[0].required_auth.threshold, 1);
		assert.equal(r.permissions[0].required_auth.keys.length, 0);
		assert.deepEqual(r.permissions[0].required_auth.accounts, [{
			"permission": {
				"actor": "eosio.prods",
				"permission": "active"
			},
			"weight": 1
		}]);
		assert.deepEqual(r.permissions[0].required_auth.waits, []);

		assert.equal(r.permissions[1].perm_name, "owner");
		assert.equal(r.permissions[1].parent, "");
		assert.equal(r.permissions[1].required_auth.threshold, 1);
		assert.equal(r.permissions[1].required_auth.keys.length, 0);
		assert.deepEqual(r.permissions[1].required_auth.accounts, [{
			"permission": {
				"actor": "eosio.prods",
				"permission": "active"
			},
			"weight": 1
		}]);
		assert.deepEqual(r.permissions[1].required_auth.waits, []);

	});
});

test.run(console.DEBUG);