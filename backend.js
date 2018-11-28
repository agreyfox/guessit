/*
后台系统，作者Ｇａｏｊｉｈｕａ
功能：１监听区块链网络，１主合约事件(Fillpool,Newone)　更新数据库
      2 监听每日合约时间，OneShoot,并更新数据库
      3自动更新监听合约对象．
    
      ｎｏｔｅ：
      １，２３：４５，停止听取本日合约，也不添加本日合约
      ２，

*/
var express = require('express');
var app = express();
var fs = require("fs");
var log4js = require('log4js');

log4js.configure({
    appenders: {
        'out': {
            type: 'stdout',
            layout: {
                type: 'basic'
            }
        },
        'file': {
            type: 'file',
            filename: "backend.log"
        }
    },
    categories: {
        default: {
            appenders: ['out', 'file'],
            level: 'debug'
        }
    }
});
var log = log4js.getLogger("backend");
log.level = 'debug';

var guessit = require('./guessit');
var guessData = require('./data.js');
var http = require('http');

var factor = Math.pow(10, 5);
var mainContract = guessit.mgrInstance; //主合约
var predictContractInstance = []; //监听合约的数组，最多
var targetContracts = [];
var stopmain = false;
var DEBUG = 1;
Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

/* tools
 */
//==========================================================================
function bin2String(array) {
    var result = "";
    for (var i = 0; i < array.length; i++) {
        result += String.fromCharCode(parseInt(array[i], 2));
    }
    return result;
}

function string2Bin(str) {
    var result = [];
    for (var i = 0; i < str.length; i++) {
        result.push(str.charCodeAt(i).toString(2));
    }
    return result;
}
//bin2String(["01100110", "01101111", "01101111"]); // "foo"

// Using your string2Bin function to test:
//bin2String(string2Bin("hello world")) === "hello world";

// Convert a hex string to a byte array
function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

// Convert a byte array to a hex string
function bytesToHex(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
    }
    return hex.join("");
}

function hex2a(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) {
        var v = parseInt(hex.substr(i, 2), 16);
        if (v) str += String.fromCharCode(v);
    }
    return str;
}

// log 显示
function log(msg) {
    var d = new Date();
    console.log(d.toLocaleDateString() + ":" + d.toTimeString() + ":" + msg);
}

Date.prototype.yyyymmdd = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(),
        (mm > 9 ? '' : '0') + mm,
        (dd > 9 ? '' : '0') + dd
    ].join('');
};

//==============================================================================
async function mainContractLisenter() {
    log.info("开始监听主合约事件:");
    var newPredictEvent = mainContract.Newone({}, {
        fromBlock: 0,
        toBlock: 'latest'
    });
    var waiting = true;
    stopmain = false;
    newPredictEvent.watch(function (err, result) {
        if (!err) {
            log.info("===============================");
            log.info("创建了新的合约：");
            log.debug(result.args);
            log.info("===============================");
            log.debug("Saving...");
            if (stopmain) {
                log.info("system exit signal...");
                newPredictEvent.stopWatching();
                //return;
            }
            var doupdate = () => {
                return (new Promise((resolve, reject) => {
                    //console.log(guessit.chain3.toUtf8(result.args.cate));
                    try {
                        guessData.updateContract({
                            name: result.args.name,
                            target: guessit.chain3.toUtf8(result.args.cate),
                            addr: result.args.url
                        });
                    } catch (e) {

                        log.error(e.toString());
                    }
                }));
            }
            var action = async function () {
                await doupdate();
            }
            action();

        } else {
            log.info("get new one event, continue...")
        }
    });

}

function hasPredictHash(st) {
    hash = st;
    guessit.guess(hash, "sha", 10, startc);
    log.info(guesshash);
    return st;
}


var guesshash = "";

function startc(abc, index) {
    log.debug("start listen log:" + targetContracts[index].name);
    log.debug("at: " + targetContracts[index].contract);

    var predictContractInstance = guessit.predictContract.at(targetContracts[index].contract);
    var ShootEvent = predictContractInstance.OneShoot({}, {
        fromBlock: 0,
        toBlock: 'latest'
    });
    var saveGuessResult = async function (value) { // to save user input when get return from block chian
        try {
            var blockNumber = value.blockNumber;
            //console.log(chain3.toDecimal(value.args.point) / factor);
            var point = (1.0 * guessit.chain3.toDecimal(value.args.point) / factor).toFixed(2);
            var name = value.args.name;
            var useraccount = value.args._from;
            var txhash = value.transactionHash;
            var timestamp = value.timestamp;
            await guessData.keepData(timestamp, blockNumber, txhash, useraccount, name, point); //保存数据
        } catch (e) {
            log.error(e.toString());
        }
    };
    targetContracts[index].worker = ShootEvent; //登记
    log.info("the event watch registed!");
    ShootEvent.watch(async function (err, result) {
        //console.log(result);
        if (!err) {
            try {
                var n = new Date();
                targetContracts[index].total++;
                log.info("information came in:", result.args);
                //log.debug(result);
                var transaction = await guessit.chain3.mc.getBlock(result.blockNumber);
                result.timestamp = transaction.timestamp;
                log.debug(result);
                saveGuessResult(result);
            } catch (e) {
                log.error(e);
            }
            //ShootEvent.stopWatching();
        } else {
            log.info("no result, continue...");
        }
    });

}

function checkInWorkQueue(contract) {
    let promise = new Promise((resolve, reject) => {
        for (var i = 0; i < targetContracts.length; i++) {
            //console.log(contract);
            //console.log(targetContracts[i].contract);
            if (contract == targetContracts[i].contract) {
                //   console.log("already in ");
                resolve(true);
            }
        }
        reject(false);
    });
    return promise;
}
//获取当前日期的后ｎ天的工作内容，作为一个工作清单数组返回
async function findWorkItem(n) {
    log.info("search new event....");
    var currenttime = new Date();
    // var targetdat = currenttime.addDays(n);
    var item;
    for (var i = -1; i < n + 1; i++) {
        var targetdat = currenttime.addDays(i);
        log.info('try to find:', targetdat);
        await guessData.getDayItem(targetdat).then(function (ret) {
            var item = ret[0];
            if (item != null) {
                log.debug("item not null", item);
                if (item.created) {
                    checkInWorkQueue(item.contract).then(function (hit) {
                        //found ,do nothing;
                    }, function (hit) {
                        //not found push the object to array
                        now = new Date();
                        var hours = now.getHours();
                        var mins = now.getMinutes();
                        if (hours == 23) { //本日合约２３：00后不添加了本日的合约
                            if (item.openday == now.yyyymmdd()) {
                                return;
                            }
                        }
                        log.info("new contract into queue:" + item.name);
                        if (!hit) {
                            targetContracts.push({
                                name: item.name,
                                dayinfo: item.openday, //格式如20181023
                                contract: item.contract,
                                stop: false,
                                total: 0,
                                start: false,
                                worker: null,
                            });
                            return true;
                        }
                    });

                } else {
                    log.error("没有找到合适合约");
                    return false;
                }
            }
        });
    }
}

async function dailyContractLisenter() {
    var prevDailyContract, currentDailyContent;

    //１获得当前的日合约
    var now;
    var next;
    var co;
    co = true;
    log.info("====================等待每日新闻＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝");
    var doJob = async function () {
        log.info("check and run");
        findWorkItem(7).then(checkAndRun);
        var checkAndRun = function () {
            now = new Date();
            try {
                for (var ii = 0; ii < targetContracts.length; ii++) {
                    var hours = now.getHours();
                    var mins = now.getMinutes();
                    var dd = now.getDate();
                    if (hours == 23 && mins > 45) { //在２３：４５　停止听今日合约
                        if (parseInt(targetContracts[ii].dayinfo) <= parseInt(now.yyyymmdd())) {
                            targetContracts[ii].stop = true;
                        }
                    }
                    if (targetContracts[ii].stop) {
                        //console.log(targetContracts);
                        if (targetContracts[ii].worker != null) {
                            targetContracts[ii].worker.stopWatching();
                        }
                        log.info("stop work for " + targetContracts[ii].name);
                        targetContracts.splice(ii, 1);
                    }
                }
                log.info("现在有" + String(targetContracts.length) + "合约");
                for (var index = 0; index < targetContracts.length; index++) {
                    if (!targetContracts[index].start) {
                        targetContracts[index].start = true;
                        startc(targetContracts[index].contract, index);
                        log.info("Start at contract watcher");
                    }
                }
            } catch (e) {
                log.error("有错误");
                log.info(e);
            }
        }
        setTimeout(checkAndRun, 4000);
    }
    doJob(); //start first time
    setInterval(doJob, 60 * 1000 * 15); //一刻钟检查一次

}
//var hash = guessit.open("上证0909", listenNewone);

var cmds = process.argv;
//console.log(cmds);
var stdin = process.openStdin();
stdin.addListener("data", function (d) {
    //console.log("you entered: [" +
    //    d.toString().trim() + "]");
    cmd = d.toString().trim();
    if (cmd == "exit" || cmd == "bye") {
        console.log("ByeBye!");
        process.exit();
    } else if (cmd == "l") {
        console.log(targetContracts);
    } else if (cmd == "help") {
        console.log("l: 列出监听对象");
        console.log("bye: 退出系统");
    }

});

if (cmds.length <= 2) {
    console.log("用法： node backend.js <command>");
    console.log("start,stop");
    return;
}
if (cmds[2] == "start") {
    mainContractLisenter();
    dailyContractLisenter();
} else if (cmds[2] == "stop") {
    console.log("stop the beckend server");
}