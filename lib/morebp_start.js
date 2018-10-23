var fibos = require('fibos');
var fs = require("fs");
var config = require('../config.json');
var process = require('process');
var producer = process.argv;

var startev = process.argv[2];
var producername = producer[3];
var public_key = producer[4];
var private_key = producer[5];
var http = producer[6];
var p2p = producer[7];

var _config_path = '../common/config_' + startev + '.json';
var _config = require(_config_path);

fibos.config_dir = _config.bp_dir + "/" + producername;
fibos.data_dir = _config.bp_dir + "/" + producername;
console.notice("producer===>", producer)
console.notice("start FIBOS producer node:", producername, 'http:', http, 'p2p:', p2p);

console.notice("config_dir:", fibos.config_dir);
console.notice("data_dir:", fibos.data_dir);


fibos.load("http", {
	"http-server-address": "0.0.0.0:" + http,
	"access-control-allow-origin": "*",
	"http-validate-host": false,
	"verbose-http-errors": true
});

fibos.load("net", {
	"p2p-peer-address": _config["p2p_peer_address"],
	"max-clients": 100,
	"p2p-listen-endpoint": "0.0.0.0:" + p2p
});

fibos.load("producer", {
	'producer-name': producername,
	'enable-stale-production': true,
	'max-transaction-time': 3000,
	'private-key': JSON.stringify([public_key, private_key])
});


fibos.load("chain", {
	"contracts-console": true,
	"delete-all-blocks": true,
	"genesis-json": "genesis.json"
});


fibos.load("chain_api");

fibos.start();