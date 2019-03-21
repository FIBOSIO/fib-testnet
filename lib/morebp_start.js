var fibos = require('fibos');
var fs = require("fs");
var config = require('../config.json');
var process = require('process');
var producer = process.argv;

var producername = producer[2];
var public_key = producer[3];
var private_key = producer[4];
var http = producer[5];
var p2p = producer[6];

var _config = require('../common/config.json');

fibos.config_dir = _config.bp_dir + "/" + producername;
fibos.data_dir = _config.bp_dir + "/" + producername;
console.notice("producer===>", producer)
console.notice("start FIBOS producer node:", producername, 'http:', http, 'p2p:', p2p);

console.notice("config_dir:", fibos.config_dir);
console.notice("data_dir:", fibos.data_dir);

let chain_config = {
	"contracts-console": true,
	'chain-state-db-size-mb': 8 * 1024,
	// "delete-all-blocks": true
};

if (!fs.exists(fibos.data_dir) && !fs.exists(fibos.config_dir)) {
	chain_config['genesis-json'] = "genesis.json";
}

fibos.load("http", {
	"http-server-address": "0.0.0.0:" + http,
	"access-control-allow-origin": "*",
	"http-validate-host": false,
	"verbose-http-errors": true
});

fibos.load("net", {
	"p2p-peer-address": _config["p2p_peer_address"],
	"max-clients": 100,
	"p2p-listen-endpoint": "0.0.0.0:" + p2p,
	"p2p-max-nodes-per-host": 25
});

fibos.load("producer", {
	'producer-name': producername,
	'enable-stale-production': true,
	'max-transaction-time': 3000,
	'private-key': JSON.stringify([public_key, private_key])
});


fibos.load("chain", chain_config);


fibos.load("chain_api");

fibos.start();