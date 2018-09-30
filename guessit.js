var Chain3 = require('chain3');
var fs = require('fs');
var solc = require('solc');
var async = require('async');
var chain3 = new Chain3();
var GuessData = require(
    './data.js'
)
var address = '0xa8dfd46d7eef2d7338ae0ba5adfd47f213f0555f';
var address_back = '0x132160be03852eeb70e6b081f193a4becc54fb43';
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
    "name": "fillpool",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": false,
        "name": "name",
        "type": "string"
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
var address_old = "0x6672007decb447992fde88de6016c2b53317d90a";
var factor = Math.pow(10,5);
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
    "constant": false,
    "inputs": [],
    "name": "getName",
    "outputs": [{
        "name": "",
        "type": "bytes32"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
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
        "type": "int32"
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
        "type": "uint32"
    }, {
        "name": "",
        "type": "uint32"
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
    "constant": true,
    "inputs": [{
        "name": "point",
        "type": "int32"
    }],
    "name": "getNunberByPoint",
    "outputs": [{
        "name": "",
        "type": "int32"
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
    "constant": false,
    "inputs": [{
        "name": "num",
        "type": "int32"
    }],
    "name": "play",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
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
        "type": "uint32"
    }, {
        "name": "noo",
        "type": "uint32"
    }],
    "name": "setBoard",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
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
    "constant": true,
    "inputs": [],
    "name": "getResult",
    "outputs": [{
        "name": "",
        "type": "uint256"
    }, {
        "name": "",
        "type": "uint256"
    }, {
        "name": "",
        "type": "uint256"
    }, {
        "name": "",
        "type": "int32"
    }, {
        "name": "",
        "type": "int32"
    }, {
        "name": "",
        "type": "int32"
    }, {
        "name": "",
        "type": "int32"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [],
    "name": "getTarget",
    "outputs": [{
        "name": "",
        "type": "bytes32"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
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
        "type": "int32"
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

var predictContract = chain3.mc.contract(pabi);

var guessitContractInstance = guessitContract.at(address);

chain3.setProvider(new chain3.providers.HttpProvider('http://127.0.0.1:8545'));

//获取主合约的ｐｏｏｌ　ｓｉｚｅ
function setDebug(num) {
    debug = num;
}

async function initialAccount(addr,value){
    console.log("send initial moac to new account....");
    var txcount = chain3.mc.getTransactionCount(me);
    var networkid = chain3.version.network;
    var rawTx = {
        from: me,   
        nonce: chain3.intToHex(txcount),
        gasPrice: chain3.intToHex(40000000000),
        gasLimit: chain3.intToHex(20000),
        to: addr,
        value: chain3.intToHex(chain3.toSha(value, 'mc')), 
        data: '0xcc',
        chainId: networkid
      }
  var cmd1 = chain3.signTransaction(rawTx, me_key);

  await chain3.mc.sendRawTransaction(cmd1, function(err, hash) {
      if (!err){
          console.log("Succeed!: ", hash);
          //ToDO need record this account.?
          return hash;
      }else{
          console.log("Chain3 error:", err.message);
          return err.message;
      }
  });
}
async function getBalance(accountaddress, mother) {

    chain3.setProvider(new chain3.providers.HttpProvider('http://127.0.0.1:8545'));
    if (chain3.isConnected()) {
        //Load the contract ABI
        NID = chain3.version.network;
        // console.log("network id is "+NID);
        var contractCode = chain3.mc.getCode(address);

        if (contractCode == '0x') {
            console.log("Contract address has no data!");
            return;
        }

        //  console.log(chain3.mc.getBalance(address));

        let m = guessitContractInstance.getBouns();
        return chain3.toDecimal(chain3.toHex(m));

    } else {
        console.log("Server RPC not connected!");
    }
}


// to create one day predict contract,用于每月批处理，ｏｂｓｌｅｔｅ
function createContract(gasValue, inByteCode) {

    var txcount = chain3.mc.getTransactionCount(me);
    console.log("Get tx account", txcount)

    var rawTx = {
        from: me,
        nonce: chain3.intToHex(txcount),
        gasPrice: chain3.intToHex(420000000000), //chain3.intToHex(chain3.mc.gasPrice),//
        gasLimit: chain3.intToHex(gasValue), //chain3.intToHex(gasValue),
        to: '0x',
        value: '0x',
        data: inByteCode,
        shardingFlag: 0, //default is global contract
        chainId: chain3.version.network
    }

    var cmd1 = chain3.signTransaction(rawTx, me_key);

    // console.log("\nSend signed TX:\n", cmd1);

    chain3.mc.sendRawTransaction(cmd1, function (err, hash) {
        if (!err) {
            console.log("创建ｐｒｅｄｉｃｔ合约，交易地址： ", hash);
            return hash;
        } else {
            console.log("Chain3 error:", err.message);
            return err.message;
        }
    });

}

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

async function open(name, target, cb) {
    if (chain3.isConnected()) {
        var getData = guessitContractInstance.newPredict.getData(name, target);

        if (getData == '0x') {
            console.log("Contract address has no data!");
            return;
        }

        let gasEstimate = chain3.mc.estimateGas({
            data: getData
        });
        console.log("gas estemate is " + gasEstimate);
        gasEstimate = '9000000';

        var networkid = chain3.version.network;

        callContractMethod(me, me_key, address, gasEstimate, networkid, getData);
        await cb();
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
    let predictInstance = predictContract.at(addr);
    //var mm = numToBytes32(point);
    if (chain3.isConnected()) {

        var getData = predictInstance.play.getData(point*factor);

        if (getData == '0x') {
            console.log("Contract address has no data!");
            return;
        }
        let gasEstimate = chain3.mc.estimateGas({
            data: getData
        });
        console.log("gas estemate is " + gasEstimate);
        var left =await chain3.mc.getBalance(senderaddr);
        console.log("You have moac:");
        console.log(chain3.toDecimal(chain3.toHex(left)));
        //gasEstimate = 9000000;
        let gasPrice = 400000000;
        var enough = gasEstimate * gasPrice < left;
        if (enough) {
            var networkid = chain3.version.network;
            var txcount = chain3.mc.getTransactionCount(senderaddr);

            var rawTx = {
                from: senderaddr,
                to: addr,
                nonce: chain3.intToHex(txcount),
                gasPrice: chain3.intToHex(4000000000),
                gasLimit: chain3.intToHex(9000000),
                value: '0x',
                data: getData,
                chainId: chain3.intToHex(networkid)
            }
            //console.log(rawTx);

            var cmd1 = chain3.signTransaction(rawTx, senderkey);
            var showErr = true;
            var hash = await new Promise(function (resolve, reject) {
                chain3.mc.sendRawTransaction(cmd1, function (err, hash) {
                    if (!err) {
                        console.log("send contract raw command at:" + hash);
                        if (showErr) {
                            var filter = chain3.mc.filter('latest');
                            var re = filter.watch(function (error, result) {
                                var receipt = chain3.mc.getTransactionReceipt(hash);
                                if (!error && receipt && receipt.blockNumber != null) {
                                    filter.stopWatching();
                                    console.log("System contract filter:===========================")
                                    console.log(receipt);
                                    console.log("System contract filter finish========================");
                                    resolve(receipt);
                                } else {
                                    console.log("no receipt and continue lisenting...");
                                }
                            });
                        } else {
                            console.log("skip the monitor...");
                            reject(false);
                        }
                    } else {
                        console.log(err);
                    }
                });
            });
            await cb();
            console.log("善后处理完成");
            return true;
        } else {
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
    //console.log("Get tx account", txcount)
    //Build the raw tx obj
    //note the transaction
    var rawTx = {
        from: src,
        to: contractAddress,
        nonce: chain3.intToHex(txcount),
        gasPrice: chain3.intToHex(4000000000),
        gasLimit: chain3.intToHex(gasValue),
        value: '0x',
        data: inByteCode,
        chainId: chain3.intToHex(inchainID)
    }
    //console.log(rawTx);

    var cmd1 = chain3.signTransaction(rawTx, mother);

    // console.log("\nSend signed TX:\n", cmd1);

    var hash = await chain3.mc.sendRawTransaction(cmd1, function (err, hash) {
        if (!err) {
            if (Debug == 1) {
                console.log("send contract raw command at:" + hash);
            }
            if (showErr) {
                var filter = chain3.mc.filter('latest');
                var result = filter.watch(function (error, result) {
                    var receipt = chain3.mc.getTransactionReceipt(hash);
                    if (!error && receipt && receipt.blockNumber != null) {
                        filter.stopWatching();
                        if (Debug == 1) {
                            console.log("System contract filter:===========================")
                            console.log(result);
                            console.log(receipt);
                            console.log("System contract filter finish========================");
                        }
                    } else {
                        console.log("no receipt and continue lisenting...");
                    }
                });
            }
        } else {
            console.log(err);
            filter.stopWatching();
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
    console.log(hour);
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
// to get 
function getTotalOfDay(addr) {
    let predictInstance = predictContract.at(addr);
    if (chain3.isConnected()) {
        //Load the contract ABI

        //  console.log(chain3.mc.getBalance(address));

        let m = predictInstance.Total();
        return chain3.toDecimal(chain3.toHex(m));

    } else {
        console.log("Server RPC not connected!");
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
        console.log(m);
        return m;

    } else {
        console.log("Server RPC not connected!");
    }
}

// 获取当前ｂｉｄ　ｃｏｎｔｒａｃｔ名称
async function getAvaiableBid(cb) {
    var curr = new Date();
    // 检查现在提交时间,根据系统时间判定用户提交到那个合约中．
    var hours = curr.getHours();
    var mins = curr.getMinutes();
    if (Debug == 1) {
        console.log("User find predict infor at " + curr.toString());
        console.log(hours);
    }
    if (hours > 15 && hours <= 23) { //15点后面提交都是到下一个交易日

        if (Debug == 1) {
            console.log("获取下一个交易日");
            console.log(curr);
        }
        var targetNextDay = await new Promise(function (resolve, reject) {
            GuessData.getNextAvaiableOpenDay(curr, function (ee) {
                resolve(ee);
            });
        });
        console.log(targetNextDay);
        cb(targetNextDay);
        return targetNextDay;

    } else if ((hours >= 0 && hours < 9) || (hours == 9 && mins < 20)) {
        //guess today

        GuessData.getNextAvaiableOpenDay(curr.valueOf(), false,function (e) {
            console.log(e);
            cb(e);
        });
    } else {
        if (Debug == 1) console.log("不能交易，测试获取下一个交易日内容");
        var targetNextDay = await new Promise(function (resolve, reject) {
            GuessData.getNextAvaiableOpenDay(curr, true,function (ee) {
                resolve(ee);
            });
        });
        console.log(targetNextDay);
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
async function guessByDate(ti,addr = me, key = me_key) {
    if (ti == null) return false;
    var currenttime = new Date(ti.tim); //用户提交时间
    // console.log(currenttime);
    var contract;
    var saveGuessResult = function (value) { // to save user input when get return from block chian
        var blockNumber = value.blockNumber;
        var point = chain3.toDecimal(value.args.point).toFixed(2);
        //console.log(point);
        var name = value.args.name;
        var useraccount = value.args._from;
        var txhash = value.transactionHash;
        GuessData.keepData(blockNumber, txhash, useraccount, name, point);
    };
    var startc = function () { //block chain lisenter get result
        console.log("Lisenting new predict at " + contract);
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
                if (Debug == 1) {
                    console.log("Waiting.....");
                }
            }
        });
    }
    //var curr = new Date();
    // 检查现在提交时间,根据系统时间判定用户提交到那个合约中．
    var hours = currenttime.getHours();
    var mins = currenttime.getMinutes();
    if (Debug == 1) {
        console.log("User submit predict at " + currenttime.toString());
        console.log(hours);
    }

    if (hours > 15 && hours <= 23) { //15点后面提交都是到下一个交易日
        // guess next day
        //   var date = new Date(this.valueOf());
        //curr.setDate(curr.getDate() + 1);
        if (Debug == 1) {
            console.log("获取下一个交易日");
            console.log(currenttime);
        }
        var targetNextDay = await new Promise(function (resolve, reject) {
            GuessData.getNextAvaiableOpenDay(currenttime, function (ee) {
                console.log(ee);
                resolve(ee);
            });
        });
        if (targetNextDay) {
            if (targetNextDay.created) {
                if(targetNextDat.name == ti.name){
                    contract = targetNextDay.contract;
                    guess(contract, ti.point, startc, addr, key);
                    return true;
                }else{
                    console.log("日期错误");
                    return false
                }
            }
        } else {
            console.log("没有找到合适合约");
            return false;
        }
    } else if ((hours > 0 && hours < 9) || (hours == 9 && mins < 20)) {
        //guess today
        GuessData.getNextAvaiableOpenDay(currenttime.valueOf(), false ,function (e) {
            var item = e[0]; //取最前面的开头的部分
            if (e != null) {
                if (item.created) {
                    if (item.name == ti.name){
                        contract = item.contract;
                        guess(contract, ti.point, startc, addr, key);
                    }else{
                        console.log("日期不对");
                        return false
                    }
                   
                }else{
                    console.log("没有找到合适合约");
                    return false;
                }
            }
        });
    } else {
        if (Debug == 1) console.log("不能交易，测试");
        return false;

    }
    // user try to search predict status,
}


//用于手工测试区块链提交
async function guessByHand(name,point, addr = me ,key = me_key){

    
    // console.log(currenttime);
    var contract;
    var saveGuessResult = function (value) { // to save user input when get return from block chian
        var blockNumber = value.blockNumber;
        console.log(chain3.toDecimal(value.args.point)/factor);
        var point = (1.0*chain3.toDecimal(value.args.point)/factor).toFixed(2);
        console.log(point);
        var name = value.args.name;
        var useraccount = value.args._from;
        var txhash = value.transactionHash;
        GuessData.keepData(blockNumber, txhash, useraccount, name, point);
    };
    var startc = function () { //block chain lisenter get result
        console.log("Lisenting new predict at " + contract);
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
                if (Debug == 1) {
                    console.log("Waiting.....");
                }
            }
        });
    }
    
    GuessData.getContractByName(name,function(data){
        console.log(data);
        contract = data[0].contract;
        guess(contract, point, startc, addr, key);
    })
 
}

function getMyPredictStatus(addr) {

}


  module.exports = {
    chain3: chain3,
    mainAccount: me,
    mainKey: me_key,
    testAccount: sender,
    testAccountKey: sendkey,
    open: open,
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
    guessByHand:guessByHand,
    initialAccount:initialAccount
}