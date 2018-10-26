var test = require('test');
var FIBOS = require('./fibos_js_patch.js');
var config = require('../config.json');
test.setup();

describe('FIBOS BIOS set sake', () => {
	var fibos;
	var ctx;
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
		ctx = fibos.contractSync("eosio");
	});


	after(function() {});

	it('setsake rate 1500000000000', () => {
		var c = fibos.getTableRowsSync(true, "eosio", "eosio", "global");

		if (c.rows[0].total_activated_stake < 1500000000000) {
			ctx.setstakeSync(1500000000000, {
				authorization: 'eosio'
			});
			var c = fibos.getTableRowsSync(true, "eosio", "eosio", "global");
			assert.equal(c.rows[0].total_activated_stake, 1500000000000);
		}
	});

	//when block up ram up too
	it('eosio setramrate  bytes_per_block 1024', () => {
		var c = fibos.getTableRowsSync(true, "eosio", "eosio", "global2");

		if (c.rows[0].new_ram_per_block == 1024) return;
		assert.equal(c.rows[0].new_ram_per_block, 0);

		ctx.setramrateSync(1024, {
			authorization: 'eosio'
		});

		var c = fibos.getTableRowsSync(true, "eosio", "eosio", "global2");
		assert.equal(c.rows[0].new_ram_per_block, 1024);

	});

});

test.run(console.DEBUG);