var guessit = require('./guessit');
var express = require('express');
var solc = require('solc');
var fs = require("fs");
var guessit = require('./guessit');
var guessData = require(
    './data.js'
)
cmds = process.argv;
if (cmds != null && cmds.length >= 3) {
    var file = cmds[2];
} else {
    console.log("Input should have contract file and contract name:\neg: node create.js create/abi");
    return;
}
if (cmds[2] == "help") {
    console.log("create.js deploy 编译并创建主合约");

    console.log("create.js new 日期 合约名 类型，　创建某日合约,日期类型为2018-10-01");
    console.log("create.js abi , 显示合约ＡＢＩ信息");
    console.log("create.js deploy 编译并创建主合约");
    return;
}
if (cmds[2] == "create") { // create 日期合约名, 2019-09-09 
    create(cmds[3], cmds[4]);
} else if (cmds[2] == "new") { //to 开启新一日竞猜合约．调用方式，node create.js new 合约名　类型
    createPredictContratByDate(cmds[3], cmds[4], cmds[5]);
} else if (cmds[2] == "abi") {
    var input = {
        'guessit.sol': fs.readFileSync('./guessit.sol', 'utf8'),
        // 'predict.sol': fs.readFileSync('./predict.sol', 'utf8')
    };

    var output = solc.compile({
        sources: input
    }, 1);
    console.log(Object.keys(output.contracts));
    var ctt = output.contracts['guessit.sol:Guessit'];

    var abi = JSON.parse(ctt.interface);
    console.log("Guessit abi:");
    console.log(JSON.stringify(abi));
    console.log("Predict abi");
    console.log(output.contracts['guessit.sol:Predict'].interface);
} else if (cmds[2] == "deploy") {
    deployGuessitContract();
} else if (cmds[2] == "daily") {
    deployDailyPredictContract();
}

// ==============================Following is function.
/*function create(name, datedata) {
    var input = {
        'guessit.sol': fs.readFileSync('./guessit.sol', 'utf8'),
        // 'predict.sol': fs.readFileSync('./predict.sol', 'utf8')
    };

    var output = solc.compile({
        sources: input
    }, 1);
    console.log(output);
    //console.log('contracts', Object.keys(output.contracts));

    var key = Object.keys(output.contracts);
    console.log(key);
    console.log("We will use 'guessit.sol:Guessit' , cause it is our main contract");
    //this is the 
    // console.log("key:", key);
    var ctt = output.contracts['guessit.sol:Guessit'];

    if (ctt == null) {
        console.log("Contract CTT is empty1");
        return;
    }

    var bytecode = "0x" + ctt.bytecode;

    var abi = JSON.parse(ctt.interface);

    console.log('abi:', ctt.interface);


    let gasEstimate = guessit.chain3.mc.estimateGas({
        data: bytecode
    });
    console.log("Gas Estimate on contract:", gasEstimate);

    createContract(gasEstimate, bytecode);
}
*/

//创建主合约
function deployGuessitContract() {
    var input = {
        'guessit.sol': fs.readFileSync('./guessit.sol', 'utf8'),
        // 'predict.sol': fs.readFileSync('./predict.sol', 'utf8')
    };

    var output = solc.compile({
        sources: input
    }, 1);
    console.log(output.errors);
    //console.log('contracts', Object.keys(output.contracts));

    var key = Object.keys(output.contracts);
    // console.log(key);
    console.log("We user 'guessit.sol:Guessit' ");
    //this is the 
    // console.log("key:", key);
    var ctt = output.contracts['guessit.sol:Guessit'];

    if (ctt == null) {
        console.log("Contract CTT is empty1");
        return;
    }

    var bytecode = "0x" + ctt.bytecode;

    var abi = JSON.parse(ctt.interface);

    console.log('abi:', ctt.interface);


    let gasEstimate = guessit.chain3.mc.estimateGas({
        data: bytecode
    });
    console.log("Gas Estimate on contract:", gasEstimate);

    createContract(90000000, bytecode);

}
//创建主合约
function deployDailyPredictContract() {
    var input = {
        'guessit.sol': fs.readFileSync('./guessit.sol', 'utf8'),
        // 'predict.sol': fs.readFileSync('./predict.sol', 'utf8')
    };

    var output = solc.compile({
        sources: input
    }, 1);
    console.log(output.errors);
    //console.log('contracts', Object.keys(output.contracts));

    var key = Object.keys(output.contracts);
    // console.log(key);
    console.log("We user 'guessit.sol:Predict' ");
    //this is the 
    // console.log("key:", key);
    var ctt = output.contracts['guessit.sol:Predict'];

    if (ctt == null) {
        console.log("Contract Predict CTT is empty1");
        return;
    }

    var bytecode = "0x" + ctt.bytecode;

    var abi = JSON.parse(ctt.interface);

    console.log('abi:', ctt.interface);


    let gasEstimate = guessit.chain3.mc.estimateGas({
        data: bytecode
    });
    console.log("Gas Estimate on contract:", gasEstimate);

    createContract(gasEstimate, bytecode);

}

/*
 * 
 */
function createContract(gasValue, inByteCode) {

    var txcount = guessit.chain3.mc.getTransactionCount(guessit.mainAccount);
    console.log("Get tx account", txcount)

    //Build the raw tx obj
    //note the transaction
    var rawTx = {
        from: guessit.mainAccount,
        nonce: guessit.chain3.intToHex(txcount),
        gasPrice: guessit.chain3.intToHex(40000000000), //chain3.intToHex(chain3.mc.gasPrice),//
        gasLimit: guessit.chain3.intToHex(9000000), //chain3.intToHex(gasValue),
        to: '0x',
        value: '0x',
        data: inByteCode,
        shardingFlag: 0, //default is global contract
        chainId: guessit.chain3.version.network
    }
    var cmd1 = guessit.chain3.signTransaction(rawTx, guessit.mainKey);

    //console.log(cmd1);
    guessit.chain3.mc.sendRawTransaction(cmd1, function (err, hash) {
        if (!err) {
            console.log("Succeed!: ", hash);
            var filter = guessit.chain3.mc.filter('latest');
            var result = filter.watch(function (error, result) {
                //var receipt = guessit.chain3.mc.getTransaction(hash);
                var receipt = guessit.chain3.mc.getTransactionReceipt(hash);
                if (!error && receipt && receipt.blockNumber != null) {
                    filter.stopWatching();
                    console.log(result);
                    console.log(receipt);
                    console.log("Recipt end=====================");
                    var trasactionlog = guessit.chain3.mc.getTransaction(hash);
                    console.log(trasactionlog);
                    return hash;
                } else {
                    console.log("error or no receipt");
                }
            });
        } else {
            console.log("Chain3 error:", err.message);
            return err.message;
        }
    });
}

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

async function createPredictContratByDate(dat, name, target) {
    var dbdata = null;
    var mm = new Date(dat).valueOf();
    console.log("start to create new contract for " + dat + " with name: " + name);
    var ok = await guessData.createOneMarketRecord({
        date: dat,
        name: name,
        target: target
    });
    console.log(ok);
    if (ok) {
        var hash = guessit.creatDailyContract(name, target, function (err, result) {
            console.log(result);
        });
    }

}