var test = require('test');
var fs = require('fs');
var coroutine = require('coroutine');
var FIBOS = require('./fibos_js_patch.js');
var config = require('../config');

var systems = require('../common/systems');

test.setup();

describe('FIBOS BIOS 启动', () => {
	var fibos;
	var producer_name = "eosio";
	var contracts_path = config["contracts_path"];

	var keyProvider = systems.map(function(d) {
		return d.private_key;
	});

	keyProvider.push(config["private_key"]);
	before(function() {
		fibos = FIBOS({
			chainId: config["chainId"],
			keyProvider: keyProvider,
			httpEndpoint: config["bios_httpEndpoint"],
			logger: {
				log: null,
				error: null
			}
		});

	});


	after(function() {});

	it("registry system accounts", () => {
		[
			"eosio.msig",
			"eosio.token",
			"eosio.ram",
			"eosio.names",
			"eosio.stake",
			"eosio.bpay",
			"eosio.vpay",
			"eosio.sudo"
		].forEach(name => {
			fibos.newaccountSync({
				creator: producer_name,
				name: name,
				owner: config["public_key"],
				active: config["public_key"]
			});
			var c = fibos.getAccountSync(name);
			assert.equal(c.account_name, name);
		});
	});

	it("registry system accounts", () => {
		systems.forEach(t => {
			fibos.newaccountSync({
				creator: producer_name,
				name: t.account,
				owner: t["public_key"],
				active: t["public_key"]
			});
			var c = fibos.getAccountSync(t.account);
			assert.equal(c.account_name, t.account);
		});
	});



	it('update eosio.code to eosio.token', () => {
		fibos.updateauthSync({
			account: 'eosio.token',
			permission: 'active',
			parent: 'owner',
			auth: {
				threshold: 1,
				keys: [{
					key: config["public_key"],
					weight: 1
				}],
				accounts: [{
					"permission": {
						"actor": "eosio.token",
						"permission": "eosio.code"
					},
					"weight": 1
				}],
				waits: []
			}
		});
	});



	it("install eosio.token", () => {
		fibos.setcodeSync("eosio.token", 0, 0, fs.readFile(contracts_path + 'eosio.token/eosio.token.wasm'), {
			authorization: 'eosio.token'
		});

		var abi = JSON.parse(fs.readFile(contracts_path + 'eosio.token/eosio.token.abi'))
		fibos.setabiSync("eosio.token", abi, {
			authorization: 'eosio.token'
		});

		var c = fibos.getCodeSync("eosio.token", true);
		assert.notEqual(c.code_hash, "0000000000000000000000000000000000000000000000000000000000000000");
	});



	it('create EOS', () => {
		var ctx = fibos.contractSync("eosio.token");
		assert.deepEqual(fibos.getTableRowsSync(true, "eosio.token", producer_name, "stats"), {
			"rows": [],
			"more": false
		});

		let r = ctx.createSync(producer_name, config.token.EOS.max_supply, {
			authorization: "eosio"
		});
		assert.equal(r.processed.action_traces[0].console, "", );

		ctx.setpositionSync('0.0000 EOS@eosio', 1, 'set postion state to true', {
			authorization: "fibos"
		}); // 第二个参数为 1 表示开仓，0 表示关仓
		assert.deepEqual(fibos.getTableRowsSync(true, "eosio.token", producer_name, "stats"), {
			"rows": [{
				"supply": "0.0000 EOS",
				"max_supply": "10000000000.0000 EOS",
				"issuer": "eosio",
				"max_exchange": "0.0000 FO",
				"connector_weight": "0.00000000000000000",
				"connector_balance": "0.0000 FO",
				"reserve_supply": "0.0000 EOS",
				"reserve_connector_balance": "0.0000 FO",
				"connector_balance_issuer": "eosio",
				"buy_fee": "0.00000000000000000",
				"sell_fee": "0.00000000000000000",
				"position": 1
			}],
			"more": false
		});
	});


	it('issue EOS to finance (fiboscouncil)', () => {
		var ctx = fibos.contractSync("eosio.token");

		let r = ctx.issueSync(systems[1].account, config.token.EOS.supply, "issue " + config.token.EOS.supply, {
			authorization: "eosio"
		});
		assert.equal(r.processed.action_traces[0].console, "", );

		assert.deepEqual(fibos.getTableRowsSync(true, "eosio.token", systems[1].account, "accounts"), {
			"rows": [{
				"primary": 0,
				"balance": {
					"quantity": config.token.EOS.supply,
					"contract": "eosio"
				}
			}],
			"more": false
		});


		assert.deepEqual(fibos.getTableRowsSync(true, "eosio.token", producer_name, "stats"), {
			"rows": [{
				"supply": config.token.EOS.supply,
				"max_supply": config.token.EOS.max_supply,
				"issuer": "eosio",
				"max_exchange": "0.0000 FO",
				"connector_weight": "0.00000000000000000",
				"connector_balance": "0.0000 FO",
				"reserve_supply": "0.0000 EOS",
				"reserve_connector_balance": "0.0000 FO",
				"connector_balance_issuer": "eosio",
				"buy_fee": "0.00000000000000000",
				"sell_fee": "0.00000000000000000",
				"position": 1
			}],
			"more": false
		});
		assert.deepEqual(fibos.getTableRowsSync(true, "eosio.token", producer_name, "accounts"), {
			"rows": [{
				"primary": 0,
				"balance": {
					"quantity": "0.0000 EOS",
					"contract": "eosio"
				}
			}],
			"more": false
		});
	});

	it('create FO', () => {
		var ctx = fibos.contractSync("eosio.token");
		assert.deepEqual(fibos.getTableRowsSync(true, "eosio.token", producer_name, "stats"), {
			"rows": [{
				"supply": config.token.EOS.supply,
				"max_supply": config.token.EOS.max_supply,
				"issuer": "eosio",
				"max_exchange": "0.0000 FO",
				"connector_weight": "0.00000000000000000",
				"connector_balance": "0.0000 FO",
				"reserve_supply": "0.0000 EOS",
				"reserve_connector_balance": "0.0000 FO",
				"connector_balance_issuer": "eosio",
				"buy_fee": "0.00000000000000000",
				"sell_fee": "0.00000000000000000",
				"position": 1
			}],
			"more": false
		});
		// 最大发行 100亿，
		let r = ctx.excreateSync(producer_name, config.token.FO.max_supply, config.token.FO.connector_weight, config.token.FO.max_exchange, config.token.FO.reserve_supply, config.token.FO.reserve_connector_balance, 0, 0, 0, 'eosio', {
			authorization: "eosio"
		});
		assert.equal(r.processed.action_traces[0].console, "", );


		ctx.setpositionSync('0.0000 FO@eosio', 1, 'set postion state to true', {
			authorization: "fibos"
		}); // 第二个参数为 1 表示开仓，0 表示关仓

		assert.deepEqual(fibos.getTableRowsSync(true, "eosio.token", producer_name, "stats"), {
			"rows": [{
				"supply": "0.0000 FO",
				"max_supply": config.token.FO.max_supply,
				"issuer": "eosio",
				"max_exchange": config.token.FO.max_exchange,
				"connector_weight": "0.00000000000000000",
				"connector_balance": "0.0000 FO",
				"reserve_supply": config.token.FO.reserve_supply,
				"reserve_connector_balance": "0.0000 FO",
				"connector_balance_issuer": "eosio",
				"buy_fee": "0.00000000000000000",
				"sell_fee": "0.00000000000000000",
				"position": 1
			}, {
				"supply": config.token.EOS.supply,
				"max_supply": config.token.EOS.max_supply,
				"issuer": "eosio",
				"max_exchange": "0.0000 FO",
				"connector_weight": "0.00000000000000000",
				"connector_balance": "0.0000 FO",
				"reserve_supply": "0.0000 EOS",
				"reserve_connector_balance": "0.0000 FO",
				"connector_balance_issuer": "eosio",
				"buy_fee": "0.00000000000000000",
				"sell_fee": "0.00000000000000000",
				"position": 1
			}],
			"more": false
		});


	});


	it('issue FO to finance (fibos)', () => {
		const ctx = fibos.contractSync("eosio.token");
		const fo_supply = "1055220780.5700 FO" //同步 2019年3月19日 FO发行总量
		const locktrans = "816394631.7453 FO@eosio"; //同步 2019年3月19日 锁仓总量

		let r = ctx.issueSync(systems[0].account, fo_supply, "issue " + fo_supply, {
			authorization: "eosio"
		});
		assert.equal(r.processed.action_traces[0].console, "", );

		assert.deepEqual(fibos.getTableRowsSync(true, "eosio.token", systems[0].account, "accounts"), {
			"rows": [{
				"primary": 0,
				"balance": {
					"quantity": fo_supply,
					"contract": "eosio"
				}
			}],
			"more": false
		});

		//锁仓FO
		ctx.exlockSync(systems[0].account, locktrans, 0, `exlock`, {
			authorization: systems[0].account
		});

		assert.deepEqual(fibos.getTableRowsSync(true, "eosio.token", systems[0].account, "lockaccounts"), {
			"rows": [{
				"primary": 0,
				"balance": {
					"quantity": "0.0000 EOS",
					"contract": "eosio"
				},
				"lock_timestamp": "1970-01-01T00:00:00"
			}, {
				"primary": 1,
				"balance": {
					"quantity": "816394631.7453 FO",
					"contract": "eosio"
				},
				"lock_timestamp": "1970-01-01T00:00:00"
			}],
			"more": false
		})


		assert.deepEqual(fibos.getTableRowsSync(true, "eosio.token", systems[0].account, "accounts"), {
			"rows": [{
				"primary": 0,
				"balance": {
					"quantity": "238826148.8247 FO",
					"contract": "eosio"
				}
			}],
			"more": false
		});
	});

	it('create FOUSDT', () => {
		var ctx = fibos.contractSync("eosio.token");
		//
		var r = ctx.excreateSync(producer_name, config.token.FOUSDT.max_supply, config.token.FOUSDT.connector_weight, config.token.FOUSDT.max_exchange, config.token.FOUSDT.reserve_supply, config.token.FOUSDT.reserve_connector_balance, 0, 0, 0, 'eosio', {
			authorization: "eosio"
		});
		assert.equal(r.processed.action_traces[0].console, "", );

		ctx.setpositionSync('0.000000 FOUSDT@eosio', 1, 'set postion state to true', {
			authorization: "fibos"
		}); //

		assert.deepEqual(fibos.getTableRowsSync(true, "eosio.token", producer_name, "stats").rows[2], {
			"supply": "0.000000 FOUSDT",
			"max_supply": config.token.FOUSDT.max_supply,
			"issuer": "eosio",
			"max_exchange": "0.0000 FO",
			"connector_weight": "0.00000000000000000",
			"connector_balance": "0.0000 FO",
			"reserve_supply": "0.000000 FOUSDT",
			"reserve_connector_balance": "0.0000 FO",
			"connector_balance_issuer": "eosio",
			"buy_fee": "0.00000000000000000",
			"sell_fee": "0.00000000000000000",
			"position": 1
		});
	});


	it('issue FOUSDT to finance (eth2fibosgtw)', () => {
		var ctx = fibos.contractSync("eosio.token");

		let r = ctx.issueSync(systems[2].account, config.token.FOUSDT.supply, "issue " + config.token.FOUSDT.supply, {
			authorization: "eosio"
		});
		assert.equal(r.processed.action_traces[0].console, "", );

		assert.deepEqual(fibos.getTableRowsSync(true, "eosio.token", systems[2].account, "accounts"), {
			"rows": [{
				"primary": 0,
				"balance": {
					"quantity": config.token.FOUSDT.supply,
					"contract": "eosio"
				}
			}],
			"more": false
		});

		assert.deepEqual(fibos.getTableRowsSync(true, "eosio.token", producer_name, "stats").rows[2], {
			"supply": config.token.FOUSDT.supply,
			"max_supply": config.token.FOUSDT.max_supply,
			"issuer": "eosio",
			"max_exchange": "0.0000 FO",
			"connector_weight": "0.00000000000000000",
			"connector_balance": "0.0000 FO",
			"reserve_supply": "0.000000 FOUSDT",
			"reserve_connector_balance": "0.0000 FO",
			"connector_balance_issuer": "eosio",
			"buy_fee": "0.00000000000000000",
			"sell_fee": "0.00000000000000000",
			"position": 1
		});
	});

	it('install eosio.msig', () => {
		var c = fibos.getCodeSync("eosio.msig", true);
		assert.equal(c.code_hash, "0000000000000000000000000000000000000000000000000000000000000000");

		fibos.setcodeSync("eosio.msig", 0, 0, fs.readFile(contracts_path + 'eosio.msig/eosio.msig.wasm'), {
			authorization: 'eosio.msig'
		});
		let abi = JSON.parse(fs.readFile(contracts_path + 'eosio.msig/eosio.msig.abi'))
		fibos.setabiSync("eosio.msig", abi, {
			authorization: 'eosio.msig'
		});

		var c = fibos.getCodeSync("eosio.msig", true);
		assert.notEqual(c.code_hash, "0000000000000000000000000000000000000000000000000000000000000000");

		var c = fibos.getAbiSync("eosio.msig")
		assert.isNotNull(c.abi);
	});


	it('install eosio.system temp', () => {
		var c = fibos.getCodeSync("eosio", true);
		assert.equal(c.code_hash, "0000000000000000000000000000000000000000000000000000000000000000");

		let abi = JSON.parse(fs.readFile(contracts_path + 'eosio.bios_temp/eosio.bios.abi'))
		fibos.setabiSync("eosio", abi, {
			authorization: "eosio"
		});

		fibos.setcodeSync("eosio", 0, 0, fs.readFile(contracts_path + 'eosio.bios_temp/eosio.bios.wasm'), {
			authorization: "eosio"
		});

		var c = fibos.getCodeSync("eosio", true);
		assert.notEqual(c.code_hash, "0000000000000000000000000000000000000000000000000000000000000000");
		var c = fibos.getAbiSync("eosio")
		assert.isNotNull(c.abi);
	});

	it('setpriv eosio.msig 1', () => {
		var ctx = fibos.contractSync("eosio");
		ctx.setpriv("eosio.msig", 1, {
			authorization: "eosio"
		});
	});


	it('system account updateauth to eosio', function() {
		var ctx = fibos.contractSync("eosio");
		[
			"eosio.msig",
			"eosio.token",
			"eosio.ram",
			"eosio.names",
			"eosio.stake",
			"eosio.bpay",
			"eosio.vpay",
			"eosio.sudo"
		].forEach(name => {
			var account_auth = [{
				permission: {
					actor: 'eosio',
					permission: 'active'
				},
				weight: 1
			}];
			if (name == 'eosio.token') {
				account_auth.push({
					"permission": {
						"actor": "eosio.token",
						"permission": "eosio.code"
					},
					"weight": 1
				})
			}
			ctx.updateauthSync({
				account: name,
				permission: "active",
				parent: 'owner',
				auth: {
					threshold: 1,
					keys: [],
					accounts: account_auth,
					waits: []
				}
			}, {
				authorization: name + "@owner"
			});

			ctx.updateauthSync({
				account: name,
				permission: "owner",
				parent: '',
				auth: {
					threshold: 1,
					keys: [],
					waits: [],
					accounts: [{
						weight: 1,
						permission: {
							actor: 'eosio',
							permission: 'active'
						}
					}]
				}
			}, {
				authorization: name + "@owner"
			});

			var r = fibos.getAccountSync(name);
			assert.equal(r.permissions[0].perm_name, "active");
			assert.equal(r.permissions[0].parent, "owner");
			assert.equal(r.permissions[0].required_auth.threshold, 1);
			assert.equal(r.permissions[0].required_auth.keys.length, 0);


			assert.deepEqual(r.permissions[0].required_auth.accounts, account_auth);
			assert.deepEqual(r.permissions[0].required_auth.waits, []);

			assert.equal(r.permissions[1].perm_name, "owner");
			assert.equal(r.permissions[1].parent, "");
			assert.equal(r.permissions[1].required_auth.threshold, 1);
			assert.equal(r.permissions[1].required_auth.keys.length, 0);
			assert.deepEqual(r.permissions[1].required_auth.accounts, [{
				"permission": {
					"actor": "eosio",
					"permission": "active"
				},
				"weight": 1
			}]);
			assert.deepEqual(r.permissions[1].required_auth.waits, []);
		});
	});

});

test.run(console.DEBUG);