var Chain3 = require('chain3');
var fs = require('fs');
var solc = require('solc');
var async = require('async');

var chain3 = new Chain3();
var GuessData = require(
    './data.js'
)
var log4js = require('log4js');

/*log4js.configure({
    appenders: { 
        'out': { type: 'stdout', layout: { type: 'basic' } } ,
        'file':{type:'file',filename:"guessit.log"}
    },
    categories: { default: { appenders: ['out','file'], level: 'info' } }
  });*/
var log = log4js.getLogger("guessit");
log.level = 'debug';

var address_back = '0xa8dfd46d7eef2d7338ae0ba5adfd47f213f0555f';
var address = '0xa1b44dca806352aaa33c236fe481b9990fe9f175';
var address_rockback = '0xcfcfe814d5600f48d4ba55101dee548da7b457df';
var address_main = '0xf4c88270a93189ceb9d7ad78a9c69653ad82b41c';
//var tokenabi =[{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"targets","outputs":[{"name":"name","type":"bytes32"},{"name":"voteCount","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"guessToday","outputs":[{"name":"weight","type":"uint256"},{"name":"guessed","type":"bool"},{"name":"vote","type":"string"},{"name":"target","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"chairperson","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"doBonus","outputs":[{"name":"ok","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_receiver","type":"address"}],"name":"send","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"etherreceiver","type":"address"},{"name":"amount","type":"uint256"}],"name":"fundtransfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"proposal","type":"uint256"},{"name":"dian","type":"uint256"}],"name":"guess","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"oneDayBillBoard","outputs":[{"name":"Predictor","type":"address"},{"name":"count","type":"uint256"},{"name":"bonus","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"guessArrayToday","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"balance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"user","type":"address"},{"name":"count","type":"uint256"},{"name":"bonus","type":"uint256"}],"name":"update","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getTodayPredicts","outputs":[{"name":"numberof_","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"v","type":"uint256"}],"name":"uintToString","outputs":[{"name":"str","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_from","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"fillpool","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_from","type":"address"},{"indexed":false,"name":"_id","type":"uint256"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"OneShot","type":"event"}];
var guessitContract = chain3.mc.contract([{
    "constant": true,
    "inputs": [],
    "name": "getBalance",
    "outputs": [{
        "name": "",
        "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [],
    "name": "OpenBonus",
    "outputs": [{
        "name": "ok",
        "type": "bool"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "_receiver",
        "type": "address"
    }],
    "name": "send",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{
        "name": "",
        "type": "uint256"
    }],
    "name": "_datastore",
    "outputs": [{
        "name": "name",
        "type": "string"
    }, {
        "name": "category",
        "type": "bytes8"
    }, {
        "name": "exist",
        "type": "bool"
    }, {
        "name": "timestamp",
        "type": "uint256"
    }, {
        "name": "addr",
        "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "isOpen",
    "outputs": [{
        "name": "",
        "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{
        "name": "",
        "type": "uint256"
    }],
    "name": "top100BillBoard",
    "outputs": [{
        "name": "Predictor",
        "type": "address"
    }, {
        "name": "count",
        "type": "uint256"
    }, {
        "name": "bonus",
        "type": "uint256"
    }, {
        "name": "credit",
        "type": "uint256"
    }, {
        "name": "isExist",
        "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "etherreceiver",
        "type": "address"
    }, {
        "name": "amount",
        "type": "uint256"
    }],
    "name": "fundtransfer",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "getNumOfPredicts",
    "outputs": [{
        "name": "",
        "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{
        "name": "index",
        "type": "uint256"
    }],
    "name": "getPredictInfo",
    "outputs": [{
        "name": "",
        "type": "address"
    }, {
        "name": "",
        "type": "string"
    }, {
        "name": "",
        "type": "uint256"
    }, {
        "name": "",
        "type": "bytes8"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "p",
        "type": "address"
    }],
    "name": "closePredict",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "getBouns",
    "outputs": [{
        "name": "",
        "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "getOwner",
    "outputs": [{
        "name": "",
        "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "r",
        "type": "uint8"
    }],
    "name": "setRatio",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "balance",
    "outputs": [{
        "name": "",
        "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "OPEN",
    "outputs": [{
        "name": "",
        "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "name",
        "type": "string"
    }, {
        "name": "cate",
        "type": "bytes8"
    }],
    "name": "newPredict",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "category",
        "type": "bytes8"
    }, {
        "name": "addr",
        "type": "address"
    }, {
        "name": "count",
        "type": "uint256"
    }, {
        "name": "bonus",
        "type": "uint256"
    }, {
        "name": "credit",
        "type": "uint256"
    }, {
        "name": "index",
        "type": "uint256"
    }],
    "name": "updateBillBoard",
    "outputs": [{
        "name": "",
        "type": "bool"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
}, {
    "payable": true,
    "stateMutability": "payable",
    "type": "fallback"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": false,
        "name": "_from",
        "type": "address"
    }, {
        "indexed": false,
        "name": "value",
        "type": "uint256"
    }],
    "name": "Fillpool",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": false,
        "name": "name",
        "type": "string"
    }, {
        "indexed": false,
        "name": "cate",
        "type": "bytes8"
    }, {
        "indexed": false,
        "name": "url",
        "type": "address"
    }],
    "name": "Newone",
    "type": "event"
}]);
var me = "0xa108c1686610c9b6ab8d34d44d8c6902cc153e87";
var me_key = "89f5db3b621bd19c94593c39a8f3f46a2a7811ecf45a1bb398b7e308324dcfc8";
var sender = "0x75041efc0fb09911cb33224e8c0b3f63575e89be";
var sendkey = "415b86d531187460b0e171eda67a791a2330e466c2b97c3978ad10520d20a758";
var thirdaddr = "0x4322af66176691860a440d38074e35c26f75DAa8";
var thirdkey = "84475baca4ee716506736954749fb10b8ae11b5c51a5a6d8ae2bd6de187dcf04";
var fouraddr = "0x13804A39B0Cf6c40FaABEbF7601d385d56F87a38";
var fourkey = "f28a848b1ae77df561c3314d3eec48d142a45ef452f1c2267ea0d8a4407166e8";
var pooladdr = "0x13804A39B0Cf6c40FaABEbF7601d385d56F87a38";
var poolkey = "f28a848b1ae77df561c3314d3eec48d142a45ef452f1c2267ea0d8a4407166e8";
var address_old = "0x6672007decb447992fde88de6016c2b53317d90a";
var factor = Math.pow(10, 5);
var gLIMIT = 230000;
var gPRICE = 20000000000;
var Debug = 1;
pabi = [{
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{
        "name": "",
        "type": "string"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "getName",
    "outputs": [{
        "name": "",
        "type": "string"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{
        "name": "o",
        "type": "address"
    }],
    "name": "getByAddr",
    "outputs": [{
        "name": "",
        "type": "int256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "no",
        "type": "uint256"
    }],
    "name": "getBoard",
    "outputs": [{
        "name": "",
        "type": "address"
    }, {
        "name": "",
        "type": "uint256"
    }, {
        "name": "",
        "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "isOpen",
    "outputs": [{
        "name": "",
        "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [],
    "name": "setClose",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": false,
    "inputs": [],
    "name": "reOpen",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "Total",
    "outputs": [{
        "name": "",
        "type": "uint64"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "getOnwer",
    "outputs": [{
        "name": "",
        "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "dateTimeAddr",
    "outputs": [{
        "name": "",
        "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "n",
        "type": "uint256"
    }, {
        "name": "addr",
        "type": "address"
    }, {
        "name": "bonus",
        "type": "uint256"
    }, {
        "name": "noo",
        "type": "uint256"
    }],
    "name": "setBoard",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "getResult",
    "outputs": [{
        "name": "",
        "type": "uint64"
    }, {
        "name": "",
        "type": "uint256"
    }, {
        "name": "",
        "type": "uint256"
    }, {
        "name": "",
        "type": "int256"
    }, {
        "name": "",
        "type": "int256"
    }, {
        "name": "",
        "type": "int256"
    }, {
        "name": "",
        "type": "int256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "tot",
        "type": "uint64"
    }, {
        "name": "up",
        "type": "uint256"
    }, {
        "name": "down",
        "type": "uint256"
    }, {
        "name": "uh",
        "type": "int256"
    }, {
        "name": "ul",
        "type": "int256"
    }, {
        "name": "dh",
        "type": "int256"
    }, {
        "name": "dl",
        "type": "int256"
    }, {
        "name": "ua",
        "type": "int256"
    }, {
        "name": "da",
        "type": "int256"
    }],
    "name": "setResult",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "num",
        "type": "int256"
    }, {
        "name": "display",
        "type": "bytes"
    }],
    "name": "play",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "getTarget",
    "outputs": [{
        "name": "",
        "type": "bytes32"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{
        "name": "str",
        "type": "string"
    }, {
        "name": "tar",
        "type": "bytes32"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": false,
        "name": "_from",
        "type": "address"
    }, {
        "indexed": false,
        "name": "name",
        "type": "string"
    }, {
        "indexed": false,
        "name": "point",
        "type": "int256"
    }],
    "name": "OneShoot",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": false,
        "name": "addr",
        "type": "address"
    }],
    "name": "newone",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": false,
        "name": "msg",
        "type": "string"
    }],
    "name": "log",
    "type": "event"
}];
chain3.setProvider(new chain3.providers.HttpProvider('http://127.0.0.1:8545'));
var predictContract = chain3.mc.contract(pabi);
var guessitContractInstance = guessitContract.at(address);


//获取主合约的ｐｏｏｌ　ｓｉｚｅ
function setDebug(num) {
    debug = num;
}

async function initialAccount(addr, value) {
    log.info("send initial moac to new account....");
    var txcount = chain3.mc.getTransactionCount(me);
    var networkid = chain3.version.network;
    var rawTx = {
        from: me,
        nonce: chain3.intToHex(txcount),
        gasPrice: chain3.intToHex(40000000000),
        gasLimit: chain3.intToHex(200000),
        to: addr,
        value: chain3.intToHex(chain3.toSha(value, 'mc')),
        data: '0xcc',
        chainId: networkid
    }
    var cmd1 = chain3.signTransaction(rawTx, me_key);

    await chain3.mc.sendRawTransaction(cmd1, function (err, hash) {
        if (!err) {
            log.debug("Succeed!: ", hash);
            //ToDO need record this account.?
            return hash;
        } else {
            log.error("Chain3 error:", err.message);
            return err.message;
        }
    });
}
async function getPoolSize() {
    return new Promise(async (resolve, reject) => {
        try {
            log.debug("Get pool sized...");
            if (chain3.isConnected()) {
                let m = await chain3.mc.getBalance(pooladdr); //主合约中的ｍｏａｃ值  // 20181104 改成固定地址
                resolve(chain3.toDecimal(chain3.toHex(m)));
            } else {
                log.error("Server RPC not connected,reconnect...");
                try {
                    chain3.setProvider(new chain3.providers.HttpProvider('http://127.0.0.1:8545'));
                    let m = await chain3.mc.getBalance(address);
                    resolve(chain3.toDecimal(chain3.toHex(m)));
                } catch (e) {
                    log.error(e);
                    resolve(0.0);
                }
            }
        } catch (e) {
            log.error(e);
            reject(0.0);
        }
    });
    return 0.0;
}

async function getBalance(accountaddress, mother) {

    chain3.setProvider(new chain3.providers.HttpProvider('http://127.0.0.1:8545'));
    if (chain3.isConnected()) {
        //Load the contract ABI
        NID = chain3.version.network;
        // console.log("network id is "+NID)
        //  console.log(chain3.mc.getBalance(address));

        let m = guessitContractInstance.getBouns();
        log.info(guessitContractInstance.getOwner());
        return chain3.toDecimal(chain3.toHex(m));

    } else {
        log.error("Server RPC not connected!");
    }
}
//old version 
function sendBonus_old(addr, amount) {
    chain3.setProvider(new chain3.providers.HttpProvider('http://127.0.0.1:8545'));
    if (chain3.isConnected()) {
        //Load the contract ABI
        NID = chain3.version.network;

        var getData = guessitContractInstance.fundtransfer.getData(addr, chain3.intToHex(chain3.toSha(amount, 'mc')));

        if (getData == '0x') {
            log.info("Contract address has no data!");
            return;
        }
        let gasEstimate = chain3.mc.estimateGas({
            data: getData
        });
        log.info("gas estemate is " + gasEstimate);
        gasEstimate = '9000000';

        var networkid = chain3.version.network;
        //cb(); //先启动回调函数监听合约事件的发生．// 使用系统主帐号开启每个日合约，
        //cb();
        callContractMethod(me, me_key, address, gasEstimate, networkid, getData, true);

    } else {
        log.error("Server RPC not connected!");
    }
}
//new send moac from poolkey
async function sendBonus(addr, amount) {
    chain3.setProvider(new chain3.providers.HttpProvider('http://127.0.0.1:8545'));
    if (chain3.isConnected()) {
        var guessitsing = [0x67, 0x75, 0x65, 0x73, 0x73, 0x69, 0x74, 0x62, 0x6f, 0x6e, 0x75, 0x73];
        //Load the contract ABI
        var txcount = chain3.mc.getTransactionCount(pooladdr);
        var networkid = chain3.version.network;
        var rawTx = {
            from: pooladdr,
            nonce: chain3.intToHex(txcount),
            gasPrice: chain3.intToHex(40000000000),
            gasLimit: chain3.intToHex(200000),
            to: addr,
            value: chain3.intToHex(chain3.toSha(amount, 'mc')),
            data: chain3.toHex('guessitbonus'),
            chainId: networkid
        }
        var cmd1 = chain3.signTransaction(rawTx, poolkey);

        await chain3.mc.sendRawTransaction(cmd1, function (err, hash) {
            if (!err) {
                log.debug("Succeed!: ", hash);
                log.info("The bonus has been sent from  poolkey to ", addr);
                //ToDO need record this account.?
                return hash;
            } else {
                log.error("Chain3 error:", err.message);
                return err.message;
            }
        });
        /* NID = chain3.version.network;

         chain3.mc.sendTransaction({
             from: pooladdr,
             value: chain3.toSha(amount, "mc"),
             to: addr,
             gas: "22000",
             gasPrice: chain3.mc.gasPrice,
             data: 'guessit'
         }, function (e, transactionHash) {
             if (!e) {
                 console.log("Transacation hash:" + transactionHash);
             }
             console.log(e);
         });*/


    } else {
        log.error("Server RPC not connected!");
    }
}


async function transferTo(addr, key, toaddr, amount, callback) {
    log.debug("The proxy function be called:", addr, toaddr, amount);
    if (chain3.isConnected()) {
        var txcount = chain3.mc.getTransactionCount(addr);
        var networkid = chain3.version.network;
        var rawTx = {
            from: addr,
            nonce: chain3.intToHex(txcount),
            gasPrice: chain3.intToHex(40000000000),
            gasLimit: chain3.intToHex(200000),
            to: toaddr,
            value: chain3.intToHex(chain3.toSha(amount, 'mc')),
            data: chain3.toHex('guessit'),
            chainId: networkid
        }
        var cmd1 = chain3.signTransaction(rawTx, key);

        await chain3.mc.sendRawTransaction(cmd1, function (err, hash) {
            if (!err) {
                log.debug("Succeed!: ", hash);
                log.info("The transacation have be submit ", toaddr, amount);
                callback(hash);
                return hash;
            } else {
                log.error("Chain3 error:", err.message);
                callback(err.message);
            }
        });

    } else {
        log.error("Server RPC not connected!");
    }
}
//获取主合约的所有事件，打印出来
async function getUpdate() {
    var i = 0;
    var newPredictEvent = guessitContractInstance.Newone({}, {
        fromBlock: 0,
        toBlock: 'latest'
    });
    var c = await newPredictEvent.get(function (err, result) {
        if (!err) {
            i = i + 1;
        }
    });
    console.log(c);
    return i;
}


//使用open用于创建每日合约,
//合约名name, 类型target,回调函数cb,用于获取成功与否后的处理
function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

async function creatDailyContract(name, target, cb) {
    if (chain3.isConnected()) {

        log.info(chain3.fromAscii(target));
        var getData = guessitContractInstance.newPredict.getData(name, chain3.toHex(target));

        if (getData == '0x') {
            log.info("Contract address has no data!");
            return;
        }
        let gasEstimate = chain3.mc.estimateGas({
            data: getData
        });
        log.info("gas estemate is " + gasEstimate);
        gasEstimate = '9000000';

        var networkid = chain3.version.network;
        //cb(); //先启动回调函数监听合约事件的发生．// 使用系统主帐号开启每个日合约，
        //cb();
        callContractMethod(me, me_key, address, gasEstimate, networkid, getData, true);
        // await    
    } else {
        log.info("Moac server is not connect");
    }
}
//将bignum 转换为bytes32 格式
function numToBytes32(bignum) {
    var n = bignum.toString(16);
    while (n.length < 64) {
        n = "0" + n;
    }
    return "0x" + n;
}
// 做一个预测
// 合约地址addr, 合约的类型target,预测的点数point,回调函数cb,
//发送者senderaddr,发送者的key,缺省为主合约
//cb中用于处理获得的结果
async function guess(addr, point, cb, senderaddr = me, senderkey = me_key) {
    log.debug("XXXX guess at :", addr);
    log.debug("to contract:", )
    let predictInstance = predictContract.at(addr);
    //var mm = numToBytes32(point);
    if (chain3.isConnected()) {
        var bye = '0x00ff00ff00';
        var last;
        if (typeof (point) == "number") {
            last = point.toFixed(2);
        } else {
            last = point;
        }
        var portion = last.split(".");
        if (portion.length < 2) {
            bye = bye + '00';
        } else {
            bye = bye + portion[1];
        }
        log.debug(bye);
        // console.log(chain3.toBigNumber(point * factor));

        var getData = predictInstance.play.getData(point * factor, bye);

        if (getData == '0x') {
            log.error("Contract address has no data!");
            return;
        }
        let gasEstimate = chain3.mc.estimateGas({
            data: getData
        });
        log.info("gas estemate is " + gasEstimate);
        var left = await chain3.mc.getBalance(senderaddr);
        var leftmoney = chain3.toDecimal(chain3.toHex(left));
        //gasEstimate = 9000000;
        let gasPrice = gPRICE; //优化值
        //gasPrice = chain3.mc.gasPrice;
        //var gprice = chain3.toDecimal(chain3.toHex(gasPrice));
        log.debug("gas price is ");
        log.debug(gasPrice);
        log.debug(gasEstimate * gasPrice);
        log.debug(leftmoney);
        var enough = gasEstimate * gasPrice < leftmoney;
        if (true) {
            //if (gasEstimate < gLIMIT) {
            gasEstimate = gLIMIT; //for speed up the 
            //}
            var networkid = chain3.version.network;
            var txcount = await chain3.mc.getTransactionCount(senderaddr);
            log.debug("nonce is " + txcount.toString());
            var rawTx = {
                from: senderaddr,
                to: addr,
                nonce: chain3.intToHex(txcount),
                //gasPrice: chain3.intToHex(gprice*2),
                gasPrice: chain3.intToHex(gasPrice),
                gasLimit: chain3.intToHex(gasEstimate),
                value: '0x0',
                data: getData,
                chainId: chain3.intToHex(networkid)
            }
            //console.log(rawTx);
            //ToDo: 等待最长３分钟，若３分钟未得到结果，就在数据库中记录ｐｅｎｄｉｎｇ信息，
            //若三分钟得到交易结果，调用await cb 获得ｓｈｏｏｔ　ｅｖｅｎｔ，　进而保存到数据库．
            var cmd1 = chain3.signTransaction(rawTx, senderkey);
            var showErr = true;
            //await cb(); //监听本ｃｏｎｔｒａｃｔ的时间
            try {
                var hash = await new Promise(function (resolve, reject) {
                    var duration = 1 * 60 * 1000;
                    var starttime = Date.now();
                    chain3.mc.sendRawTransaction(cmd1, function (err, hash) {
                        if (!err) {
                            log.debug("send contract raw command at: " + hash);
                            var filter = chain3.mc.filter('latest');
                            try {
                                if (showErr) {
                                    var re = filter.watch(function (error, result) {
                                        var receipt = chain3.mc.getTransactionReceipt(hash);
                                        log.debug(Date.now() - starttime);
                                        if (!error && receipt && receipt.blockNumber != null) {
                                            filter.stopWatching();
                                            setDebug(receipt);
                                            log.debug("System contract filter finish========================");
                                            resolve(receipt);
                                        } else {
                                            log.debug("no receipt and continue lisenting...");
                                        }
                                        if (Date.now() - starttime > duration) {
                                            log.debug(Date.now().toLocaleString());
                                            log.debug("overdue and exit filter watching...");
                                            //tokeep undetermind data here;
                                            filter.stopWatching();
                                            reject("timeout");
                                        }
                                    });
                                } else {
                                    log.info("skip the monitor...");
                                    reject(false);
                                }
                            } catch (e) {
                                log.errors(e.toString());
                                filter.stopWatching();
                                reject("error");
                            }
                        } else {
                            log.error(err);
                            reject(err);
                        }
                    });

                });
            } catch (e) {
                log.error("Send Raw Transacation error");
            }

            log.info("善后处理完成");
            return true;
        } else {
            log.error("no money to submit");
            return false; //no money
        }
    }
}
/*
 * Call a contract with the input byteCode
 * 
 */
async function callContractMethod(src, mother, contractAddress, gasValue, inchainID, inByteCode, showErr = false) {
    // src is walletaddress
    var txcount = chain3.mc.getTransactionCount(src);
    var rawTx = {
        from: src,
        to: contractAddress,
        nonce: chain3.intToHex(txcount),
        gasPrice: chain3.intToHex(41000000000),
        gasLimit: chain3.intToHex(gasValue),
        value: '0x',
        data: inByteCode,
        chainId: chain3.intToHex(inchainID)
    }
    log.debug(JSON.stringify(rawTx));

    var cmd1 = chain3.signTransaction(rawTx, mother);

    var hash = await chain3.mc.sendRawTransaction(cmd1, function (err, hash) {
        if (!err) {

            log.debug("send contract raw command at:" + hash);

            if (showErr) {
                var filter = chain3.mc.filter('latest');
                var result = filter.watch(function (error, result) {
                    var receipt = chain3.mc.getTransactionReceipt(hash);
                    if (!error && receipt && receipt.blockNumber != null) {
                        filter.stopWatching();
                        if (Debug == 1) {
                            log.debug(result);
                            log.debug(receipt);
                            log.debug("System contract filter finish========================");
                            var transaction = chain3.mc.getTransaction(hash);
                            log.debug(transaction);
                        }
                    } else {
                        log.debug("no receipt and continue lisenting...");
                    }
                });
            }
        } else {
            log.error(err);
            //filter.stopWatching();
        }
    });

}

// 空为当前日期和时间 dat为毫秒
async function getCurrentContract(dat = null) {
    var datestring = "";
    var ret;

    var dd = new Date();

    /*if (dat != null) {
        dd = new Date(dat);
    }*/
    var hour = dd.getHours();
    var mins = dd.getMinutes();
    if (hour >= 15 && hour <= 24) { //the contract will be next day
        ret = await new Promise(function (resolve, reject) {
            GuessData.getNextOpenDay(dd.valueOf(), function (value) {
                //console.log(value);
                resolve(value);
            });
        });
    } else if ((hour == 9 && mins > 20) || hour < 9) { // can be today.
        ret = await new Promise(function (resolve, reject) {
            GuessData.getOpenDay(dd.toLocaleDateString(), function (e) {
                if (e != null) {
                    if (e.created) {
                        resolve(e);
                    } else {
                        reject(-1);
                    }
                } else {
                    reject(-2);
                }

            });
        });
    }
    return ret;
}

async function getMainContractOwner() {
    if (chain3.isConnected()) {
        let m = await guessitContractInstance.getOwner();
        log.debug(m);

    } else {
        log.error("Server RPC not connected!");
    }
}

//获取日合约名称
async function getDailyContractName(addr) {
    let predict = predictContract.at(addr);
    try {
        if (chain3.isConnected()) {
            // console.log(predict);
            let m = await predict.getName.call();
            log.info(chain3.toUtf8(m));

        } else {
            log.error("Server RPC not connected!");
        }
    } catch (e) {
        log.error(e.toString());
    }

}
// to get 
function getTotalOfDay(addr) {
    let predictInstance = predictContract.at(addr);
    if (chain3.isConnected()) {
        //Load the contract ABI

        //  console.log(chain3.mc.getBalance(address));

        let m = predictInstance.Total();
        return chain3.toDecimal(chain3.toHex(m));

    } else {
        log.error("Server RPC not connected!");
    }
}
// to get predict contract current result
function getPredictResult(addr) {
    let predictInstance = predictContract.at(addr);
    if (chain3.isConnected()) {
        //Load the contract ABI
        NID = chain3.version.network;
        // console.log("network id is "+NID);

        //  console.log(chain3.mc.getBalance(address));

        var m = predictInstance.getResult();
        log.info(m);
        return m;

    } else {
        log.error("Server RPC not connected!");
    }
}

// 获取当前ｂｉｄ　ｃｏｎｔｒａｃｔ名称
async function getAvaiableBid(cb) {
    var curr = new Date();
    // 检查现在提交时间,根据系统时间判定用户提交到那个合约中．
    var hours = curr.getHours();
    var mins = curr.getMinutes();

    log.debug("User find predict infor at " + curr.toString());
    log.debug(hours);

    if (hours > 15 && hours <= 23) { //15点后面提交都是到下一个交易日

        log.debug("获取下一个交易日");
        log.debug(curr);

        GuessData.getNextAvaiableOpenDay(curr, true, function (ee) {
            cb(ee);
        });

    } else if ((hours >= 0 && hours < 9) || (hours == 9 && mins < 20)) {
        //guess today

        GuessData.getNextAvaiableOpenDay(curr.valueOf(), false, function (e) {
            log.debug(e);
            cb(e);
        });
    } else {
        if (Debug == 1) console.log("不能交易，测试获取下一个交易日内容");
        var targetNextDay = await new Promise(function (resolve, reject) {
            GuessData.getNextAvaiableOpenDay(curr, true, function (ee) {
                resolve(ee);
            });
        });
        log.debug(targetNextDay);
        cb(targetNextDay);
        //cb(null);
    }

}


// 输入ｔｉ对象，
/*  {
    tim // 提交时间　millisecond
    name // 上证0819
    point 点数
}   
*/
// 包tim 毫秒 提交时间
// , point , target ,use user addr and key
// time 为猜测标的格式为 openday 格式'2018-9-23'
async function guessByDate(ti, addr = me, key = me_key) {
    if (ti == null) return false;
    var currenttime = new Date(ti.tim); //用户提交时间
    // console.log(currenttime);
    var contract;
    var saveGuessResult = async function (value) { // to save user input when get return from block chian
        try {
            var blockNumber = value.blockNumber;
            var point = chain3.toDecimal(value.args.point).toFixed(2);
            //console.log(point);
            var name = value.args.name;
            var useraccount = value.args._from;
            var txhash = value.transactionHash;
            var transaction = await chain3.mc.getBlock(result.blockNumber);
            GuessData.keepData(transaction.timestamp, blockNumber, txhash, useraccount, name, point);
        } catch (e) {
            log.error(e);
        }
    };
    var startc = function () { //block chain lisenter get result
        log.info("Lisenting new predict at " + contract);
        var predictContractInstance = predictContract.at(contract);
        var ShootEvent = predictContractInstance.OneShoot({}, {
            // fromBlock: 0,
            toBlock: 'latest'
        });
        ShootEvent.watch(function (err, result) {
            if (!err) {
                if (Debug == 1) console.log(result);
                if (result.address == contract && result) {
                    // 保留用户的投注信息
                    saveGuessResult(result);
                }
                ShootEvent.stopWatching();
                return;
            } else {

                log.debug("Waiting.....");

            }
        });
    }
    //var curr = new Date();
    // 检查现在提交时间,根据系统时间判定用户提交到那个合约中．
    var hours = currenttime.getHours();
    var mins = currenttime.getMinutes();

    log.debug("User submit predict at " + currenttime.toString());
    log.debug(hours);


    if (hours > 15 && hours <= 23) { //15点后面提交都是到下一个交易日
        // guess next day
        //   var date = new Date(this.valueOf());
        //curr.setDate(curr.getDate() + 1);

        log.debug("获取下一个交易日");
        log.debug(currenttime);

        var targetNextDay = await new Promise(function (resolve, reject) {
            GuessData.getNextAvaiableOpenDay(currenttime, function (ee) {
                log.debug(ee);
                resolve(ee);
            });
        });
        if (targetNextDay) {
            if (targetNextDay.created) {
                if (targetNextDat.name == ti.name) {
                    contract = targetNextDay.contract;
                    guess(contract, ti.point, startc, addr, key);
                    return true;
                } else {
                    log.debug("日期错误");
                    return false
                }
            }
        } else {
            log.error("没有找到合适合约");
            return false;
        }
    } else if ((hours > 0 && hours < 9) || (hours == 9 && mins < 20)) {
        //guess today
        GuessData.getNextAvaiableOpenDay(currenttime.valueOf(), false, function (e) {
            var item = e[0]; //取最前面的开头的部分
            if (e != null) {
                if (item.created) {
                    if (item.name == ti.name) {
                        contract = item.contract;
                        guess(contract, ti.point, startc, addr, key);
                    } else {
                        log.debug("日期不对");
                        return false
                    }

                } else {
                    log.debug("没有找到合适合约");
                    return false;
                }
            }
        });
    } else {
        log.debug("不能交易，测试");
        return false;

    }
    // user try to search predict status,
}


//用于手工测试区块链提交，仅用于手工测试
async function guessByHand(name, point, addr = me, key = me_key) {


    // console.log(currenttime);
    var contract;
    var saveGuessResult = function (value) { // to save user input when get return from block chian
        var blockNumber = value.blockNumber;
        console.log(chain3.toDecimal(value.args.point) / factor);
        var point = (1.0 * chain3.toDecimal(value.args.point) / factor).toFixed(2);
        //console.log(point);
        var name = value.args.name;
        var useraccount = value.args._from;
        var txhash = value.transactionHash;
        GuessData.keepData(blockNumber, txhash, useraccount, name, point);
    };
    var startc = async function () { //block chain lisenter get result
        console.log("Lisenting new predict at " + contract);
        const duration = 3 * 60 * 1000;
        var starttime = Date.now();
        var predictContractInstance = predictContract.at(contract);
        var ShootEvent = predictContractInstance.OneShoot({}, {
            // fromBlock: 0,
            toBlock: 'latest'
        });
        log.debug(Date().toString() + "Start to listent shooter event 3 mins at " + contract);
        ShootEvent.watch(function (err, result) {
            var m = Date.now() - starttime;
            log(m);
            if (m > duration) {
                log.debug("退出监听");
                ShootEvent.stopWatching();
                return;
            }
            if (!err) {
                ilog.debug(result);
                if (result.address == contract && result) {
                    // 保留用户的投注信息
                    saveGuessResult(result);
                }
                ShootEvent.stopWatching();
                return;
            } else {
                log.debug("Waiting.....");

            }
        });
    }

    GuessData.getContractByName(name, function (data) {
        log.debug("found ", name, " at:", data[0].contract);
        contract = data[0].contract;
        guess(contract, point, startc, addr, key);
    })

}

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

Date.prototype.yyyymmdd = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(),
        (mm > 9 ? '' : '0') + mm,
        (dd > 9 ? '' : '0') + dd
    ].join('');
};

//根据提交时间猜测
async function guessNow(point, addr = me, key = me_key) {
    var currenttime = new Date();
    var hours = currenttime.getHours();
    var mins = currenttime.getMinutes();
    log.debug("User submit predict at " + currenttime.toString());
    log.debug(hours);

    // console.log(currenttime);
    var contract;
    var startc = async function () { //block chain lisenter get result
        log.info("Lisenting new predict at " + contract);
        const duration = 1 * 60 * 1000;
        var starttime = Date.now();
        var predictContractInstance = predictContract.at(contract);
        var ShootEvent = predictContractInstance.OneShoot({}, {
            // fromBlock: 0,
            toBlock: 'latest'
        });
        console.log(Date().toString() + "Start to listent shooter event 3 mins at " + contract);
        ShootEvent.watch(function (err, result) {
            var m = Date.now() - starttime;
            log.debug(m);
            if (m > duration) {
                log.debug("退出监听");
                ShootEvent.stopWatching();
                return;
            }
            if (!err) {
                if (Debug == 1) log(result);
                if (result.address == contract && result) {
                    // 保留用户的投注信息
                    //saveGuessResult(result);
                    log.debug("Found!");
                }
                ShootEvent.stopWatching();
                return;
            } else {
                if (Debug == 1) {
                    log.debug("Waiting.....");
                }
            }
        });
    }
    if (hours > 15 && hours <= 23) { //15点后面提交都是到下一个交易日
        //获取下一个交易日的
        log.debug(addr + "提交明天!");
        GuessData.getNextTradeDayContract(currenttime.valueOf(), true, function (e) {

            var item = e[0]; //取最前面的开头的部分
            if (e != null) {
                if (item.created) {
                    contract = item.contract;
                    guess(contract, point, startc, addr, key);

                } else {
                    log.debug("没有找到合适合约");
                    return false;
                }
            }
        });
        // guessForNextBid(point,addr,key);
        return;
    }
    if ((hours >= 0 && hours < 9) || (hours == 9 && mins <= 15)) {
        log.debug(addr + "提交!");
        GuessData.getOpenDay(currenttime.valueOf(), function (e) {
            var item = e[0]; //取最前面的开头的部分
            if (e != null) {
                if (item.created) {

                    contract = item.contract;
                    guess(contract, point, startc, addr, key);

                } else {
                    log.debug("没有找到合适合约");
                    return false;
                }
            }
        });
        return true;
    }
    if ((hours > 9 && hours < 15) || (hours == 9 && mins > 15)) {
        log.debug("提交时间错误");
        log.debug("本次提交完成！");

        GuessData.getNextTradeDayContract(currenttime.valueOf(), true, function (e) {
            var item = e[0]; //取最前面的开头的部分
            if (e != null) {
                if (item.created) {
                    log.debug(item);
                    contract = item.contract;
                    guess(contract, point, startc, addr, key);

                } else {
                    log.debug("没有找到合适合约");
                    return false;
                }
            }
        });
        return true;
    }

    return;
    /*GuessData.getContractByName(name, function (data) {
        console.log(data);
        contract = data[0].contract;
        guess(contract, point, startc, addr, key);
    })*/

}
// Try to get all shoot event result on one smart contract
function getPredictAll(addr) {
    log.info("Find predict event at " + addr);
    var saveGuessResult = async function (value) { // to save user input when get return from block chian
        try {
            var blockNumber = value.blockNumber;
            //console.log(chain3.toDecimal(value.args.point) / factor);
            var point = (1.0 * chain3.toDecimal(value.args.point) / factor).toFixed(2);
            var name = value.args.name;
            var useraccount = value.args._from;
            var txhash = value.transactionHash;
            var transaction = await chain3.mc.getBlock(value.blockNumber);
            GuessData.keepData(transaction.timestamp, blockNumber, txhash, useraccount, name, point);
        } catch (e) {
            log.error("save use guessit error");
            log.error(e);
        }
    };
    var predictContractInstance = predictContract.at(addr);
    var ShootEvent = predictContractInstance.OneShoot({}, { //allevent ToDo.
        fromBlock: 0,
        toBlock: 'latest'
    });
    ShootEvent.watch(function (err, result) {
        log.debug(JSON.stringify(result));
        if (!err) {
            if (result.address == addr && result) {
                // 保留用户的投注信息
                saveGuessResult(result);
            }
            //ShootEvent.stopWatching();
            return;
        } else {

            log.debug("Waiting....." + err.toString());

        }
    });
    log.info("start filter about the addr");
    var filter = chain3.mc.filter({
        fromBlock: 0,
        toBlock: 'latest',
        address: addr
    });

    filter.watch(function (error, result) {
        if (!error) {
            var msg = result.blockNumber;
            log.debug(msg + ":" + JSON.stringify(result.TxData))
        } else {
            log.debugg("err:" + error);
        }


    });
    log.debug("wait for any result");
}

function getMainContractEvent() {

    var NewEvent = guessitContractInstance.Newone({}, {
        fromBlock: 0,
        toBlock: 'latest'
    });
    log.info("开始主合约处理：" + address);

    NewEvent.watch(function (err, result) {
        log.debug('inside event');
        if (!err) {
            log.debug(JSON.stringify(result));
            return;
        } else {
            log.debug("Waiting....." + err.toString());

        }
    });

}
//获取用户创建事件
function getPassEventFilter() {
    var options = {
        fromBlock: 0,
        toBlock: 'latest'
    }
    var filter = guessitContractInstance.allEvents(options);
    var myResults = filter.get(function (error, logs) {
        log.debug(logs);
    });
    filter.stopWatching();
}

// 作废
function log(msg) {
    var d = new Date();
    console.log(d.toLocaleDateString() + " " + d.toTimeString() + ":" + msg);
}

module.exports = {
    chain3: chain3,
    mainAccount: me,
    mainKey: me_key,
    testAccount: sender,
    testAccountKey: sendkey,
    testAccount2: thirdaddr,
    testAccountKey2: thirdkey,
    creatDailyContract: creatDailyContract,
    mgrInstance: guessitContractInstance,
    predictContract: predictContract,
    getBalance: getBalance,
    contratCall: callContractMethod,
    guess: guess,
    getAll: getUpdate,
    getCurrentContract: getCurrentContract,
    guessByDate: guessByDate,
    getTotalOfDay: getTotalOfDay,
    getPredictResult: getPredictResult,
    getAvaiableBid: getAvaiableBid,
    guessByHand: guessByHand,
    initialAccount: initialAccount,
    getPredictAll: getPredictAll,
    getMainContractEvent: getMainContractEvent,
    getMainContractOwner: getMainContractOwner,
    getPassEventFilter: getPassEventFilter,
    getDailyContractName: getDailyContractName,
    tempaddr: fouraddr,
    tempkey: fourkey,
    guessNow: guessNow,
    getPoolSize: getPoolSize,
    sendBonus: sendBonus,
    poolaccount: pooladdr,
    poolkey: poolkey,
    transferTo: transferTo
}