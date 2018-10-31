var fibos = require('fibos');
var fs = require("fs");
var config = require('../config.json');
var accounts = require('../common/bpaccounts.json');
console.notice("start first FIBOS producer node");

var startev = process.argv[2];
var _config_path = '../common/config_' + startev + '.json';
var _config = require(_config_path);

var producer = accounts[0];

var producername = producer.account;
var public_key = producer.public_key;
var private_key = producer.private_key;

fibos.config_dir = _config.bp_dir + "/" + producername;
fibos.data_dir = _config.bp_dir + "/" + producername;


console.notice("config_dir:", fibos.config_dir);
console.notice("data_dir:", fibos.data_dir);

fibos.load("http", {
	"http-server-address": "0.0.0.0:8801",
	"access-control-allow-origin": "*",
	"http-validate-host": false,
	"verbose-http-errors": true //打开报错
});

fibos.load("net", {
	"p2p-peer-address": config["bios_p2p_peer_address"],
	"max-clients": 100,
	"p2p-listen-endpoint": "0.0.0.0:9801"
});

fibos.load("producer", {
	'producer-name': producername,
	'enable-stale-production': true,
	'max-transaction-time': 3000,
	'private-key': JSON.stringify([public_key, private_key])
});


fibos.load("chain", {
	"contracts-console": true,
	// 'chain-state-db-size-mb': 8 * 1024,
	"delete-all-blocks": true,
	"genesis-json": "genesis.json"
});

fibos.load("chain_api");
fibos.load("history");
fibos.load("history_api");
fibos.start();