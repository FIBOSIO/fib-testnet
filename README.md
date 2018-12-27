## 启动过程

## 1.启动创世节点服务

## 2.初始化系统
	1）创建系统账户

## 3.初始化系账户

## 4.启动第一个BP节点

## 5.BP节点给自己投票

## 6.设置数量开关BP开始出块

## 7.权限移交


## tips

	common/config_dev.json -------- p2p,http info
	common/bpaccounts.json -------- bp accounts info
	common/fibossystems.json --------fibos systems accounts info

## cmd

	killall fibos // kill  fibos
	
## step 1 install
	
	fibos --install   

## step 2 start dev

	1) fibos index.js dev  // start No.1 bp FIBOS, do all things, init, bp start and make blocks 
	
	or fibos index.js dev 2 or fibos index.js dev 21 // also can  start more one bps what you want

 	2) fibos morebps.js dev 2 5  //where you start one want start more bps join testnet , this can start No.2 to No.5 bps  , http port is 8802 to 8805 


## more info

### http

	http://127.0.0.1:8801  
	http://127.0.0.1:8802 
	http://127.0.0.1:8803 
	http://127.0.0.1:8804
	http://127.0.0.1:8805

	http://127.0.0.1:8806 
	http://127.0.0.1:8807 
	http://127.0.0.1:8808 
	http://127.0.0.1:8809 
	http://127.0.0.1:8810 

	http://127.0.0.1:8811 
	http://127.0.0.1:8812 
	http://127.0.0.1:8813 
	http://127.0.0.1:8814 
	http://127.0.0.1:8815

	http://127.0.0.1:8816 
	http://127.0.0.1:8817
	http://127.0.0.1:8818
	http://127.0.0.1:8819
	http://127.0.0.1:8820
	http://127.0.0.1:8821

### p2p

	"127.0.0.1:9801",
	"127.0.0.1:9802",
	"127.0.0.1:9803",
	"127.0.0.1:9804",
	"127.0.0.1:9805",

	"127.0.0.1:9806",
	"127.0.0.1:9807",
	"127.0.0.1:9808",
	"127.0.0.1:9809",
	"127.0.0.1:9810",

	"127.0.0.1:9811",
	"127.0.0.1:9812",
	"127.0.0.1:9813",
	"127.0.0.1:9814",
	"127.0.0.1:9815",

	"127.0.0.1:9816",
	"127.0.0.1:9817",
	"127.0.0.1:9818",
	"127.0.0.1:9819",
	"127.0.0.1:9820",
	"127.0.0.1:9821"
