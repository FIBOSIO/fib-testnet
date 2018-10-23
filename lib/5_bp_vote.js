var test = require('test');
var FIBOS = require('./fibos_js_patch.js');
var config = require('../config.json');
var accounts = require('../common/bpaccounts.json');

test.setup();

describe('FIBOS account rg producer', () => {
	var fibos;
	var ctx;
	before(function() {
		fibos = FIBOS({
			chainId: config["chainId"],
			keyProvider: accounts.map(function(d) {
				return d.private_key;
			}),
			httpEndpoint: config["bp_httpEndpoint"],
			logger: {
				log: null,
				error: null
			}
		});
		ctx = fibos.contractSync("eosio");
	});


	after(function() {});

	it('to be producer', () => {
		ctx.regproducerSync(accounts[0].account, accounts[0].public_key, "https://testnet.fibos.fo", 1, {
			"authorization": accounts[0].account
		});

		var c = fibos.getTableRowsSync({
			json: true,
			code: "eosio",
			scope: "eosio",
			table: "producers",
			limit: 50
		});
		assert.equal(c.rows.length, 1);
		assert.equal(c.rows[0].owner, accounts[0].account);
		assert.equal(c.rows[0].total_votes, "0.00000000000000000");
		assert.equal(c.rows[0].unpaid_blocks, 0);
	});

	it('vote self', () => {
		ctx.voteproducerSync(accounts[0].account, "", [accounts[0].account], {
			"authorization": accounts[0].account
		});
		var c = fibos.getTableRowsSync({
			json: true,
			code: "eosio",
			scope: "eosio",
			table: "producers",
			limit: 50
		});
		assert.equal(c.rows.length, 1);
		assert.equal(c.rows[0].owner, accounts[0].account);
		// assert.equal(c.rows[0].total_votes, "918636309241549.50000000000000000");
		assert.equal(c.rows[0].unpaid_blocks, 0);
	});

});

test.run(console.DEBUG);