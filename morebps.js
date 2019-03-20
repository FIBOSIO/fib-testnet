var test = require('test');
var process = require('process');
var coroutine = require('coroutine');
var accounts = require('./common/bpaccounts.json');
var config = require('./config.json');
var FIBOS = require('fibos.js');
var _config = require('./common/config.json');

var cmdarr = process.argv;

if (cmdarr.length < 4) {
	console.notice('cmd like this: fibos morebps.js 2 6');
	process.exit(0);
}

var bp_startnum = Number(cmdarr[2]) || 2;
var bp_endnum = Number(cmdarr[3]) || 2;
if (bp_startnum > bp_endnum || bp_endnum > 25) {
	console.notice('cmd like this: fibos morebps.js 2 25');
	process.exit(0);
}


var startev = cmdarr[2];

test.setup();

describe(startev + 'more bps start', () => {
	var fibos;
	var ctx;
	before(function() {
		fibos = FIBOS({
			chainId: config["chainId"],
			keyProvider: accounts.map(function(info) {
				return info.private_key;
			}),
			httpEndpoint: _config["httpEndpoint"],
			logger: {
				log: null,
				error: null
			}
		});

		ctx = fibos.contractSync("eosio");
	});

	it('start bps', function() {
		var httpEndpoint = 8800;
		var p2p = 9800;
		var startccounts = [];
		accounts.forEach(function(info, index) {
			if (index >= bp_startnum - 1 && index <= bp_endnum - 1) {
				info.http = httpEndpoint + index + 1;
				info.p2p = p2p + index + 1;
				info.num = index + 1;
				startccounts.push(info);
			}
		});
		console.notice('after 5 seconds  start NO.', bp_startnum, ' to No.', bp_endnum, ' BPs');
		console.notice('http port is', httpEndpoint + bp_startnum, ' to ', httpEndpoint + bp_endnum);
		coroutine.sleep(5000);
		startccounts.forEach(function(info) {

			process.start('fibos', ['./lib/morebp_start.js', info.account, info.public_key, info.private_key, info.http, info.p2p]);

			coroutine.sleep(1000);

			ctx.regproducerSync(info.account, info.public_key, "http://testnet.fo", 1, {
				"authorization": info.account
			});
			ctx.voteproducerSync(info.account, "", [info.account], {
				"authorization": info.account
			});
			console.notice('BP No.', info.num, ' is running');
			coroutine.sleep(2000);
		});

	});


	after(function() {});

});

test.run(console.DEBUG);