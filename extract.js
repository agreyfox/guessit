/*
后台系统，作者Ｇａｏｊｉｈｕａ
功能：１分析数据guesslog，找出所需数据
      2 定时更新每日大盘收盘和开盘数据：３：３０
      3　定于每次合约投注结束，运行采集的数据：10:30 开始
数据内容{ 
    "_id" : ObjectId("5bc564822a77eaa7534fe0bb"), 
    "addr" : "0xb5b98e48f4d314fff6aefa91be8337c90cd0cf8d", 
    "bidtime" : "20181016", 
    "name" : "上证1017", 
    "point" : "0.03", 
    "timestamp" : 1539662968, 
    "block" : 1124141, 
    "ctime" : 1539662978695, 
    "tx" : "0xb2f20eb23c16fcf206d01a457e8f6b24b38b6daf2bb28975c8c56e7ba557c7a2" 
    }
    ｎｏｔｅ:
        一个地址可以有多个发送数据，只去最后一个
        发送ｔｉｍｅｓｔａｍｐ在预测区间才有效　３:00~第二天9:15 
        要获得的数据包含：
            １）总共多少个有效投注　dayTotal
            ２）涨跌个数分别统计，分别最高值，最低值
            ３）根据昨日收盘计算最接近的一个地址
            ４）计算所有投注的平均值
            ５）和上证的误差
    
    方法：
        1:1:01 创建本日记录数据库信息，并写入昨日收盘记录，启动计算程序
        收集用户投注在合约中
        每天9:20 结束本日投注
        计算程序：开始计算收集所有有效投注，从昨日15:01分开始到９:20的所有投注信息的统计内容
            包括最高值，用户重复提交的应该不计算在内，有ａｒｃｈｉｖｅ标志
            批处理有效投注archive:0的记录
            １获取所有投注次数，更新
            ２获取有效投注次数，更新
            ３批处理5000条，排序，统计差值为负数的，正数个个数，最大，最小值
            ４计算和目标最接近的地址，
            ５更新记录表示计算完成
*/
var express = require("express");
var app = express();
var fs = require("fs");
var guessit = require("./guessit");
var guessData = require("./data");
var http = require("http");
var superagent = require("superagent");
var iconv = require("iconv-lite");
iconv.skipDecodeWarning = true;
var async = require("async");
var CronJob = require("cron").CronJob;

var log4js = require("log4js");

log4js.configure({
    appenders: {
        out: {
            type: "stdout",
            layout: {
                type: "basic"
            }
        },
        file: {
            type: "file",
            filename: "extract.log"
        }
    },
    categories: {
        default: {
            appenders: ["out", "file"],
            level: "debug"
        }
    }
});
var log = log4js.getLogger("extract");
log.level = "debug";

var factor = Math.pow(10, 5);

var DEBUG = 1;
var STOP = false;

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

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
        hex.push((bytes[i] & 0xf).toString(16));
    }
    return hex.join("");
}

function hex2a(hex) {
    var str = "";
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

    return [
        this.getFullYear(),
        (mm > 9 ? "" : "0") + mm,
        (dd > 9 ? "" : "0") + dd
    ].join("");
};

//==============================================================================
// ========================main loop ===========================================
async function mainProcessLoop() {
    //１获取时间
    var ptime = new Date();
    var hours = ptime.getHours();
    var mins = ptime.getMinutes();
    var day = ptime.getDay();
    var month = ptime.getMonth();
    var year = ptime.getFullYear();
    log.debug("The mail loop start at ", new Date());
    //2 若是>3:30
    await guessData.getDayItem(ptime).then(function (ret) {
        var item = ret[0];
        if (item) {
            log.debug("totday is contract:", item.name);
        }
    });
}
//根据计算结果向第一名发送奖金，
//计算方法是poolsize 的３０％，如果是ｂｉｎｇｏ了，就是说完全正确，则赢取全部奖金
//想智能合约发出奖金指令．智能合约自动发出．
// dateinfo 格式为 20181123
async function SendWinner(dateinfo, needsend) {
    log.debug("System searching the winner...", dateinfo);
    guessData.getDayWinner(dateinfo, async function (winnerArray) {
        if (winnerArray.length == 0) {
            log.info("no winner yet");
            return;
        }
        log.debug("Found today winner is ", winnerArray[0].addr);
        var balance = await guessit.chain3.toDecimal(
            guessit.chain3.toHex(
                await guessit.chain3.mc.getBalance(guessit.poolaccount)
            )
        );
        //var balance2 = await guessit.getBalance();
        balance = balance / Math.pow(10, 18);
        log.info("主合约有", balance);
        var price = 0;
        if (winnerArray[0].bingo) {
            if (price < 1) {
                log.debug("No pool ,pleaes fill pool first");
                return;
            }
            price = balance - 1;
        } else {
            price = balance * 0.3; //否是３％
        }
        if (!winnerArray[0].sent) {
            if (needsend) {
                await guessit.sendBonus(winnerArray[0].addr, price, balance);
            }
            log.debug(
                "Bonus send job done: Sent ",
                price,
                " to addr:",
                winnerArray[0].addr
            );
        } else {
            log.debug("Bonus had Sent already");
        }
        guessData.updateUserbonus(winnerArray[0].addr, dateinfo, price, balance);
    });
}

async function dailyComputeJob() {
    const url = "hq.sinajs.cn";
    var options = {
        host: url,
        port: 80,
        path: "/list=sh000001",
        gzip: true
    };

    superagent
        .get("http://hq.sinajs.cn/list=sh000001")
        .then(res => {
            // console.log(iconv.decode(res.body,"GBK"));
            try {
                var ret = iconv.decode(res.body, "GBK");
                var stockdata = ret.split(",");
                //console.log(stockdata[2]);
                log.debug("日期，今日收盘，昨日收盘");
                log.debug(stockdata[30], stockdata[3], stockdata[2]);

                async.waterfall(
                    [
                        async function () {
                                log.debug("更新今天");
                                //createa record
                                // stockdata[30] is '2018-10-01'
                                //Note: 如果新浪有变化，这个地方也需要改变
                                //更新本日记录，并设置可计算标志
                                await guessData.updateRecord(
                                    stockdata[3],
                                    stockdata[2],
                                    stockdata[30]
                                );
                            },
                            async function () {
                                    //创建下一天的记录
                                    log.debug("准备明天");
                                    await guessData.createOneRecord(stockdata[3], stockdata[30]);
                                },
                                async function () {
                                        log.debug("Start to update base bonus ");
                                        var now = new Date();
                                        await guessData.setBaseBonus(now.yyyymmdd());
                                        log.debug("done for base bonus");
                                    },
                                    async function () {
                                            log.debug("Start to caculate");
                                            var now = new Date();
                                            await guessData.caculate(now.yyyymmdd());
                                            // callback(null, "ok");
                                        },
                                        async function () {
                                            log.debug("Send the moac to winner");
                                            var now = new Date();
                                            hour = now.getHours();
                                            log.debug("Sending....", now.toDateString());
                                            await SendWinner(now.yyyymmdd(), true);
                                        }
                    ],
                    function (err, caption) {
                        console.log(err);
                        console.log(caption)
                        // Node.js and JavaScript Rock!
                    }
                );
                //guessData.insertOneRecord(stockdata[2],stockdata[30]);
            } catch (e) {
                console.log(e);
                log.error(e);
            }
        })
        .catch(err => {
            console.log(err);
            log.error(err);
        });
}

//=========================cmd process =========================================
var cmds = process.argv;
//console.log(cmds);
var stdin = process.openStdin();
stdin.addListener("data", function (d) {
    cmd = d.toString().trim();
    cmds = cmd.split(" ");
    if (cmd == "exit" || cmd == "bye") {
        log.info("ByeBye!");
        process.exit();
    } else if (cmd == "job") {
        dailyComputeJob();
    } else if (cmd == "restart") {
        var now = new Date();
        guessData.caculate(now.yyyymmdd());
    } else if (cmds[0] == "c") {
        //计算某日的结果
        guessData.caculate(cmds[1]);
    } else if (cmds[0] == "u") {
        //计算某日的结果
        guessData.updateJob(cmds[1]);
    } else if (cmd == "stat") {
        guessData.getTodayData(function (data) {
            log.info(data);
        });
    } else if (cmd == "help") {
        console.log("stat: 看系统分析结果");
        console.log("c 20181010: 计算分析某日结果");
        console.log("u 20181010: 计算投注人数");
        console.log("job:  重新做今天计算分析工作");
        console.log("base: set one day base bonus");
        console.log("send: 发奖金");
        console.log("fsend:　更新奖金数据，但不发");
        console.log("bye: 退出系统");
    } else if (cmds[0] == "send") {
        log.info("send command");
        SendWinner(cmds[1], true); //cmd[1]中是日期
    } else if (cmds[0] == "base") {
        log.info("send command");
        guessData.setBaseBonus(cmds[1]); //cmd[1]中是日期

    } else if (cmds[0] == "index") {
        log.info("set index number and create a record");
        guessData.createOneRecord(cmds[1], cmds[2]);

    } else if (cmds[0] == "fsend") {
        log.info("fake send moac  command");
        SendWinner(cmds[1], false); //cmd[1]中是日期
    }
});

if (cmds.length <= 2) {
    log.info("用法： node extract.js <command>");
    log.info("start,stop");
    return;
}
if (cmds[2] == "start") {
    var sleep = function (ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    };
    var stoptobreak = async function () {
        console.log("Taking a break...");
        await sleep(60000);
    }

    // '01 1 1 * * 1-5' 每周一到五，晚上1:1:01分执行
    const job = new CronJob(
        "00 05 15 * * 1-5",
        function () {
            log.info("Start daily job to compute the winner and send bonus:", new Date());
            dailyComputeJob();
            stoptobreak();
            return false;
        },
        function (ret) {
            log.info(ret);
        }
    );
    job.start();

    const updateJob = new CronJob("00 */5 * * * 1-5", function () {
        log.debug("updating....", new Date());
        var now = new Date();
        log.debug(now);
        hour = now.getHours();
        if (hour >= 15) {
            now = now.addDays(1);
        }
        guessData.updateJob(now.yyyymmdd());
        stoptobreak();
    });
    updateJob.start();
    /*const sendWinnerJob = new CronJob("00 10 15 * * 1-6", function () {
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        async function demo() {
            console.log("Taking a break...");
            await sleep(60000);
        }
        var now = new Date();

        hour = now.getHours();

        log.debug("Sending....", now.toDateString());
        SendWinner(now.yyyymmdd());
        demo();
    });*/
    // sendWinnerJob.start();
    // var now = new Date();
    // guessData.caculate(now.yyyymmdd());
    mainProcessLoop();
} else if (cmds[2] == "stop") {
    console.log("stop the extract process");
}