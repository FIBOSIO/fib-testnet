var FIBOS = require('fibos.js');
var config = require('../config');
var test = require('test');
var systems = require('../common/systems');
var fibossystems = require('../common/fibossystems');
var bpaccounts = require('../common/bpaccounts');


var fs = require('fs');
test.setup();

describe('create accounts', () => {
	var fibos;
	var ctx;
	before(function() {
		fibos = FIBOS({
			chainId: config["chainId"],
			keyProvider: systems.concat(fibossystems).map(function(d) {
				return d.private_key;
			}),
			httpEndpoint: config['bios_httpEndpoint'],
			logger: {
				log: null,
				error: null
			}
		});
		ctx = fibos.contractSync("eosio.token");
	});

	it('fibos exchange 500000 EOS to FO', function() {
		let r = ctx.exchangeSync('fibos', `500000.0000 EOS@eosio`, `0.0000 FO@eosio`, `exchange EOS to FO`, {
			authorization: 'fibos'
		});
		var c = fibos.getTableRowsSync(true, "eosio.token", "fibos", "accounts");
		assert.deepEqual(c.rows, [{
			"primary": 0,
			"balance": {
				"quantity": "9999500000.0000 EOS",
				"contract": "eosio"
			}
		}, {
			"primary": 1,
			"balance": {
				"quantity": "368598570.2359 FO",
				"contract": "eosio"
			}
		}]);

	});

	it('fibos extransfer 9999500000.0000 EOS to FO', function() {
		ctx.extransferSync('fibos', "fiboscouncil", "9999500000.0000 EOS@eosio", "eosO to fiboscouncil", {
			"authorization": "fibos"
		});
		var c = fibos.getTableRowsSync(true, "eosio.token", "fiboscouncil", "accounts");
		assert.deepEqual(c.rows, [{
			"primary": 0,
			"balance": {
				"quantity": "9999500000.0000 EOS",
				"contract": "eosio"
			}
		}])
	});

	it('fibos create fibossystems and bp accounts', function() {
		var arr = fibossystems.concat(bpaccounts);
		arr.forEach(t => {
			console.notice('create account: ', t.account);
			var r = fibos.transactionSync(tr => {
				tr.newaccount({
					creator: 'fibos',
					name: t.account,
					owner: t.public_key,
					active: t.public_key
				}, {
					"authorization": "fibos"
				});

				tr.buyrambytes({
					payer: 'fibos',
					receiver: t.account,
					bytes: 1024 * 1024 * 2
				}, {
					"authorization": "fibos"
				});

				tr.delegatebw({
					from: 'fibos',
					receiver: t.account,
					stake_net_quantity: '10.0000 FO',
					stake_cpu_quantity: '10.0000 FO',
					transfer: 1
				}, {
					"authorization": "fibos"
				});
			}, {
				"authorization": "fibos"
			});

		})
	});

	it('extransfer FO to bpaccounts', function() {
		bpaccounts.forEach(t => {
			var delefo = 1000 * (1 + Math.round(99 * Math.random())); //10000 - 100000
			console.notice('buy ' + delefo + ' net and cpu to ', t.account);

			fibos.delegatebw({
				from: 'fibos',
				receiver: t.account,
				stake_net_quantity: delefo + '.0000 FO',
				stake_cpu_quantity: delefo + '.0000 FO',
				transfer: 1
			}, {
				"authorization": "fibos"
			});
			console.notice('extransfer 10000.0000 FO to ', t.account);
			ctx.extransferSync('fibos', t.account, "10000.0000 FO@eosio", "FO to " + t.account, {
				"authorization": "fibos"
			});
		});
	})

	it('extransfer 10000000 FO to fibossystems', function() {

		fibossystems.forEach(t => {
			console.notice('extransfer 10000000.0000 FO to ', t.account);
			ctx.extransferSync('fibos', t.account, "10000000.0000 FO@eosio", "FO to " + t.account, {
				"authorization": "fibos"
			});

		});
	})

});

test.run(console.DEBUG);