var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require("fs");
var guessit = require('./guessit');
var guessdata = require('./data.js');
var CryptoJS = require("crypto-js");

var basekey = "0x75041efc0fb09911cb33224e8c0b3f63575e89be";

app.use(bodyParser.urlencoded({ extended: false }));
const {
  MongoPool,
  clientConnect,
  clientClose
} = require('./dbMongo');

app.use('/pages', express.static(__dirname + '/pages'));

app.get('/cru', function (req, res) {
  var crypto = require('crypto');
  var secp256k1 = require('secp256k1');
  var keccak = require('keccak');

  //获得随机的32个字节作为私钥，在使用中，请注意随机数来源的安全
  var privateKey = crypto.randomBytes(32);
  //获得公钥
  var publicKey = secp256k1.publicKeyCreate(privateKey, false).slice(1);
  //获得地址
  var address = keccak('keccak256').update(publicKey).digest().slice(-20);
  console.log("new user request======================")
  console.log('public key', publicKey.toString('hex'));
  console.log('private key', privateKey.toString('hex'));
  console.log('address', '0x' + address.toString('hex'));
  console.log("end new user request======================");
  data = {};
  data["private"] = privateKey.toString('hex');
  data["public"] = publicKey.toString('hex');
  data["address"] = address.toString('hex');
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
})

app.get('/ava', function (req, res) {
  var n = new Date();
  var handle = function (data) {
    res.setHeader('Content-Type', 'application/json');
    res.header("Content-Type", "application/json; charset=utf-8");
    if (data) {
      // console.log("found avaliable contract" + data.contract);
      res.end(JSON.stringify(data));
    } else {
      res.end();
    }
  };
  guessit.getAvaiableBid(handle);
  /// 2018-09-23 NEED TO BE SERSIS.
})
//get system version,
//check if need upgrade.
app.get("/ver", function (err, res) {
  console.log(JSON.stringify(res.headers));
  var result = {
    version: 0.1,
    game: null
  };
  var handle = function (data) {
    res.setHeader('Content-Type', 'application/json');
    res.header("Content-Type", "application/json; charset=utf-8");
    if (data) {
      // console.log("found avaliable contract" + data.contract);
      result.game = data;  
    }
    res.end(JSON.stringify(result));
  };
  guessit.getAvaiableBid(handle);

});
//get user bid stat
//get totday person bid result, return the bid hash, 是否已经ｂｉｄ成功
app.get("/stat", function (req, res) {
  var me = req.headers['me'];
  var keyHex = CryptoJS.enc.Utf8.parse(basekey);

  var pla = CryptoJS.DES.decrypt({
      ciphertext: CryptoJS.enc.Base64.parse(me)
    },
    keyHex, {
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.ECB
    });
    var keypair = pla.toString(CryptoJS.enc.Utf8);
    guessdata.getUserStat(keypair,function(result){
      res.setHeader('Content-Type', 'application/json');
      res.header("Content-Type", "application/json; charset=utf-8");
      if(result){
        res.end(JSON.stringify({result:"ok",data:result}));
      }else{
        res.end(JSON.stringify({result:"error"}));
      }
    });
});

//get last week winner info
app.get("/winner", function (req, res) {

});
//man to bid on once for a day.
/* input data is header has one parameter, it is addr+private key value, and combine key:
using chain3 sha as verification.
*/
app.post("/play", function (req, res) {
  
  var me = req.headers['me'];
  var key = req.headers['key'];
  // console.log(me);
  var dd = Date.now();
  var keyHex = CryptoJS.enc.Utf8.parse(basekey);

  var pla = CryptoJS.DES.decrypt({
      ciphertext: CryptoJS.enc.Base64.parse(me)
    },
    keyHex, {
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.ECB
    });
  // console.log(pla.toString(CryptoJS.enc.Utf8));
  var keypair = pla.toString(CryptoJS.enc.Utf8).split(",");
  if (keypair.length != 2) {
    res.end("bad");
    console.log("Someone try to access system");
    return;
  }
  var keyinfo = CryptoJS.DES.decrypt({
      ciphertext: CryptoJS.enc.Base64.parse(key)
    },
    CryptoJS.enc.Utf8.parse(keypair[0]), {
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.ECB
    });
  var keymess = keyinfo.toString(CryptoJS.enc.Utf8);
  //console.log(keymess);
  var keymessinfo = keymess.split(",");
  if (keymessinfo.length != 2) {
    res.end("bad");
    console.log("Someone use bad key");
    return;
  }
  if (keymessinfo[1] != keypair[0]) {
    res.end("bad");
    console.log("Someone try to hack system");
    console.log(keypair);
    return;
  }
  try {
    //console.log(dd);
    //console.log(parseInt(keymessinfo[0]));
    //console.log(dd - parseInt(keymessinfo[0]));
    if ((dd - parseInt(keymessinfo[0])) > 10000) {
      res.end("bad");
      console.log("Time is not qulified!");
      console.log(keypair);
      return;
    }
  } catch (e) {
    res.end("bad");
    console.log("Time format is not correct");
    console.log(keypair);
    return;
  }
  console.log("Normal user  ok,ready for submit to blockchain========================");
  res.setHeader('Content-Type', 'application/json');
  res.header("Content-Type", "application/json; charset=utf-8");
  try {
    var si = req.body;
    console.log( keypair[0], keypair[1]);
    guessit.guessByHand(  //call system to submit the bid, input is user sub time, 
      si.name,
      si.point,
      keypair[0],
      keypair[1]
      );
    res.end(JSON.stringify({"result":"ok","msg":"提交成功，请过几分钟刷新区块部分查看提交结果！"}));
    return;

  }catch(e){
    console.log("input number is error");
    res.end(JSON.stringify({"result":"error","msg":"提交失败"}));
  }

});
// allow user to submit suggestion
app.post("suggest", function (err, res) {

});



var server = app.listen(11545, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Guessit service app listening at http://%s:%s", host, port)

})