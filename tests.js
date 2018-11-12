var express = require('express');
var app = express();
var fs = require("fs");
var guessit = require('./guessit');
var guessData = require('./data');
var http = require('http');


// console(guessit.getBalance("0x812023c3bae6eded9d6d080d2f078f907c419a22","a5023825666a65c5cc135fa8fd5fc6b106713b361a2b9b9d9d7edcf1d64fb5ac"));
var predictContractInstance;
// guessit.open("0x812023c3bae6eded9d6d080d2f078f907c419a22","a5023825666a65c5cc135fa8fd5fc6b106713b361a2b9b9d9d7edcf1d64fb5ac",1,2000);
function listenNewone() {
    var newPredictEvent = guessit.mgrInstance.Newone({}, {
        //fromBlock: 0,
        toBlock: 'latest'
    });
    var waiting = true;
    newPredictEvent.watch(function (err, result) {
        if (!err) {
            console.log(" predict contract create at ");
            console.log(result.args);
            newPredictEvent.stopWatching();
            waiting = true;
            hasPredictHash(result.args.url);
            //return result.args.address;
        } else {
            console.log("get new one event, continue...")
        }
    });

}

function hasPredictHash(st) {
    hash = st;
    guessit.guess(hash, "sha", 10, startc);
    console.log(guesshash);
    return st;
}

/*newPredictEvent.watch(function (err, result) {
    if (!err) {
        console.log(" predict contract create at ");
        console.log(result.args);
        // startc(result.args.url);
    }
    return;
});*/

/*function startFilter(abc) {
    var filter = guessit.chain3.mc.filter('latest');
    var result = filter.watch(function (error, result) {
        var receipt = chain3.mc.getTransactionReceipt(hash);
        if (!error && receipt && receipt.blockNumber != null) {
            //filter.stopWatching();
            console.log("hhhhhh:");
            console.log(result);

        } else {
            console.log("no receipt and continue lisenting...");
        }
    });

}*/

var guesshash = "";

function startc(abc) {
    console.log("start listen log");
    var predictContractInstance = guessit.predictContract.at(abc);
    var ShootEvent = predictContractInstance.OneShoot({}, {
        toBlock: 'latest'
    });
    ShootEvent.watch(function (err, result) {
        if (!err) {
            console.log("mew log:");
            console.log('stop watch');
            console.log(result);
            guesshash = "abc";
            ShootEvent.stopWatching();
        } else {
            console.log("no result, continue...");
        }
    });
    /* logEvent.get(function(err,result){
         console.log(result);
     });*/
}

//var hash = guessit.open("上证0909", listenNewone);

var cmds = process.argv;
//console.log(cmds);
if (cmds.length <= 2) {
    console.log("用法： node test.js <command>");
    console.log("data,openNewPredict,start,guess,total,current");
    return;
}
if (cmds[2] == "data") {
    var i = guessit.getCurrentContract(cmds[3]).then(function (result) {
        console.log(result);
    });
} else if (cmds[2] == "make") {
    guessData.createMarketDay(cmds[3], Number(cmds[4]));
} else if (cmds[2] == 'guess') {
    console.log("tests.js 上证0923 4.0");
    var h = guessit.guessByHand(cmds[3], cmds[4], guessit.mainAccount, guessit.mainKey);
    // console.log("ersult is " + h);

} else if (cmds[2] == 'total') {
    //console.log(guessit.getTotalOfDay("0x09a200b554b5cc2fad99bed324f840b3223d469f"));
    //guessit.getResultOfDay("0x09a200b554b5cc2fad99bed324f840b3223d469f");
    console.log(guessit.chain3.toDecimal(guessit.chain3.toHex(guessit.chain3.mc.getBalance(guessit.testAccount))));
    console.log(guessit.getBalance());
    var mm = async function () {
        var mm = await guessit.getPoolSize();
    }
    mm().then(function (result) {
        console.log(result);
    });
} else if (cmds[2] == "current") {
    console.log("here is current bid contract");
    guessit.getAvaiableBid(function (e) {
        console.log(e);
    });
    /*
     for(var i=0;i<1000;i++){
         guessData.getOpenDay((new Date()).valueOf(),function(){console.log(i.toString()+"done")});
         http.request('http://127.0.0.1:11545/ava',function(err,resp){
             console.log(resp.body);
             resp.end();
             this.end();
         });
     }*/
    //console.log(h);

} else if (cmds[2] == 'result') {
    guessit.getPredictResult(cmds[3]);
} else if (cmds[2] == 'send') {
    guessit.initialAccount(cmds[3], cmds[4]);
} else if (cmds[2] == 'getall') {
    guessit.getDailyContractName(cmds[3]);
    guessit.getPredictAll(cmds[3]);
} else if (cmds[2] == 'mainevent') {
    guessit.getMainContractEvent();
} else if (cmds[2] == "owner") {
    console.log("main contract is")
    guessit.getMainContractOwner();
    console.log("----------EVENT--------")
    guessit.getPassEventFilter();
} else if (cmds[2] == 'pool') {
    console.log(guessit.getPoolSize());
} else if (cmds[2] == 'bonus') {
    guessit.sendBonus(cmds[3], cmds[4]);
} else if (cmds[2] == 'profile') {
    guessData.generateUserProfile(cmds[3], function (data) {
        console.log(data);
    });
} else if (cmds[2] == 'board') {
    guessData.generateUserBillBorad(function (d) {
        console.log(d);
    });
} else if (cmds[2] == 'history') {
    guessData.getHistory(function (d) {
        console.log(d);
    });
} else if (cmds[2] == 'bingo') {
    guessData.isBingo(cmds[3], cmds[4], function (e) {
        console.log(e);
    })

} else if (cmds[2] == 'lastwinner') {
    guessData.getLatestWinner(function (e) {
        console.log(e);
    })

} else if (cmds[2] == 'winner') {
    guessData.getWinners("no", function (e) {
        console.log(e);
    })

}