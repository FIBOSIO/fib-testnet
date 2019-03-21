const fibos = require('fibos');
const fs = require("fs");
const config = require('./common/config.json');

console.notice("start FIBOS full node");


fibos.config_dir = config.bp_dir + "/full";
fibos.data_dir = config.bp_dir + "/full";

console.notice("config_dir:", fibos.config_dir);
console.notice("data_dir:", fibos.data_dir);


fibos.load("http", {
	"http-server-address": "0.0.0.0:8870",
	"access-control-allow-origin": "*",
	"http-validate-host": false,
	"verbose-http-errors": true //打开报错
});



fibos.load("net", {
	"p2p-peer-address": config.p2p_peer_address,
	"max-clients": 0,
	"p2p-listen-endpoint": "0.0.0.0:9870",
	"p2p-max-nodes-per-host": 25,
	"agent-name": "FIBOS Full"
});

let chain_config = {
	"contracts-console": true,
	'chain-state-db-size-mb': 8 * 1024,
	// "delete-all-blocks": true
};

if (!fs.exists(fibos.data_dir) && !fs.exists(fibos.config_dir)) {
	chain_config['genesis-json'] = "genesis.json";
}

fibos.load("producer", {
	// 'enable-stale-production': true,
	'max-transaction-time': 3000
});

fibos.load("chain", chain_config);
fibos.load("chain_api");
fibos.load("history", {
	"filter-on": "*"
});
fibos.load("history_api");

fibos.start();