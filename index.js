var test = require('test');
var fs = require('fs');
var process = require('process');
var coroutine = require('coroutine');
var config = require('./config.json');
var FIBOS = require('fibos.js');

var cmdarr = process.argv;

if (cmdarr.length < 2) {
	console.notice('cmd like this: fibos index.js');
	process.exit(0);
}

var startbpnum = Number(cmdarr[2]) || 1;

var startev = cmdarr[2];

console.notice('start  testnet after 2 seconds');
coroutine.sleep(2000);


test.setup();

describe('FIBOS One Press Start', () => {
	var p;
	before(function() {});
	it('create accounts files with pubkey and privatekey', function() {
		["systems", "fibossystems"].forEach(function(fname) {
			var filepath = "common/" + fname + ".json";
			if (!fs.exists(filepath)) {
				var fileaccout = [];
				config[fname].forEach(function(aname) {
					var prikey = FIBOS.modules.ecc.randomKeySync();
					fileaccout.push({
						"account": aname,
						"public_key": FIBOS.modules.ecc.privateToPublic(prikey),
						"private_key": prikey
					});

				});
				fs.writeFile(filepath, JSON.stringify(fileaccout));
			}
		});

		var filepath = "common/bpaccounts.json";
		if (fs.exists(filepath)) return;
		var testaccounts = [];
		['a', 'b', 'c', 'd', 'e'].forEach(function(n) {
			for (var i = 1; i <= 5; i++) {
				var prikey = FIBOS.modules.ecc.randomKeySync();
				var name = "testnetbpp" + n + i;
				testaccounts.push({
					"account": name,
					"public_key": FIBOS.modules.ecc.privateToPublic(prikey),
					"private_key": prikey
				});
			}
		});
		fs.writeFile(filepath, JSON.stringify(testaccounts));
	});


	//2 init bios
	it('steps 1  bios_start', function() {
		console.notice("steps 1 bios_start");
		p = process.start('fibos', ['./lib/1_bios_start.js']);
		var fibos = FIBOS({
			chainId: config["chain_id"],
			keyProvider: "",
			httpEndpoint: config["bios_httpEndpoint"],
			logger: {
				log: null,
				error: null
			}
		});
		while (true) {
			coroutine.sleep(1000);
			try {
				let info = fibos.getInfoSync();
				if (info.head_block_num >= 3)
					break;
			} catch (e) {}
		}
	});

	//2 init bios
	it('steps 2  bios_init', function() {
		process.run('fibos', ['./lib/2_bios_init.js']);
	});

	//3 creataccounts
	it('steps 3 createaccounts', function() {
		process.run('fibos', ['./lib/3_createaccounts.js']);
	});
	//4 bpstart
	it('steps 4 firstbp_start', function() {
		var bpp = process.start('fibos', ['./lib/4_firstbp_start.js']);
		var bpfibos = FIBOS({
			chainId: config["chain_id"],
			keyProvider: "",
			httpEndpoint: config["bp_httpEndpoint"],
			logger: {
				log: null,
				error: null
			}
		});
		while (true) {
			coroutine.sleep(100);
			try {
				let bpinfo = bpfibos.getInfoSync();
				if (bpinfo.head_block_num >= 3)
					break;
			} catch (e) {}
		}
	});

	//5 to be producers
	it('steps 5 bp_vote', function() {
		process.run('fibos', ['./lib/5_bp_vote.js']);
	});

	//6 to be producers
	it('steps 6 setstakes', function() {
		process.run('fibos', ['./lib/6_setstakes.js']);
	});
	//7 check an last update auth
	it('steps 7 bp make blocks', function() {
		var fibos = FIBOS({
			chainId: config["chain_id"],
			keyProvider: "",
			httpEndpoint: config["bp_httpEndpoint"],
			logger: {
				log: null,
				error: null
			}
		});
		while (true) {
			coroutine.sleep(1000);
			try {
				var c = fibos.getTableRowsSync({
					json: true,
					code: "eosio",
					scope: "eosio",
					table: "producers",
					limit: 50
				});
				if (c.rows[0].unpaid_blocks >= 3)
					break;
			} catch (e) {
				console.log(e)
			}
		}

	});

	it('7 bios_success', function() {
		process.run('fibos', ['./lib/7_bios_success.js']);
	});

	it('8 start more bps', function() {
		if (startbpnum > 1) {
			process.run('fibos', ['./morebps.js', 2, startbpnum]);
		}
		console.notice('start FIBOS over');
	});

	after(function() {
		p.kill(15);
		// p.wait();
	});

});

test.run(console.DEBUG);