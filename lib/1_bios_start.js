var fibos = require('fibos');
var config = require('../config');
var fs = require('fs');
var _config = require('../common/config.json');

console.notice("start FIBOS name:eosio");

fibos.config_dir = _config.bios_dir;
fibos.data_dir = _config.bios_dir;

console.notice("config_dir:", fibos.config_dir);
console.notice("data_dir:", fibos.data_dir);


fibos.load("http", {
	"http-server-address": "0.0.0.0:8870",
	"access-control-allow-origin": "*",
	"http-validate-host": false,
	"verbose-http-errors": true
});

fibos.load("net", {
	"p2p-listen-endpoint": "0.0.0.0:9870"
});

fibos.load("producer", {
	'producer-name': 'eosio',
	'enable-stale-production': true,
	'max-transaction-time': 3000,
});

fibos.load("chain", {
	"delete-all-blocks": true,
	'genesis-json': 'genesis.json'
});
fibos.load("chain_api");
fibos.start();