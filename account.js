var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var fs = require("fs");
var guessit = require("./guessit");
var guessdata = require("./data.js");
var log4js = require("log4js");

log4js.configure({
  appenders: {
    out: {
      type: "stdout",
      layout: {
        type: "basic"
      }
    },
    service: {
      type: "file",
      filename: "webapi.log"
    }
  },
  categories: {
    default: {
      appenders: ["out", "service"],
      level: "debug"
    }
  }
});
var log = log4js.getLogger("services");
log.level = "debug";
var CryptoJS = require("crypto-js");

var basekey = "0x75041efc0fb09911cb33224e8c0b3f63575e89be";
var DEBUG = 1;
var VERSION = "0.1.1";
var createKeccakHash = require("keccak");

function toChecksumAddress(address) {
  address = address.toLowerCase().replace("0x", "");
  var hash = createKeccakHash("keccak256")
    .update(address)
    .digest("hex");
  var ret = "0x";

  for (var i = 0; i < address.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      ret += address[i].toUpperCase();
    } else {
      ret += address[i];
    }
  }

  return ret;
}

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);


app.use("/pages", express.static(__dirname + "/pages"));
app.use("/apk", express.static(__dirname + "/pages/guessit.apk"));

app.get("/cru", function (req, res) {
  var crypto = require("crypto");
  var secp256k1 = require("secp256k1");
  var keccak = require("keccak");

  //获得随机的32个字节作为私钥，在使用中，请注意随机数来源的安全
  var privateKey = crypto.randomBytes(32);
  //获得公钥
  var publicKey = secp256k1.publicKeyCreate(privateKey, false).slice(1);
  //获得地址
  var address = keccak("keccak256")
    .update(publicKey)
    .digest()
    .slice(-20);
  log.debug("new user request======================");
  log.debug("public key", publicKey.toString("hex"));
  log.debug("private key", privateKey.toString("hex"));
  log.debug("address", "0x" + address.toString("hex"));
  log.debug("end new user request======================");
  data = {};
  data["private"] = privateKey.toString("hex");
  data["public"] = publicKey.toString("hex");
  data["address"] = toChecksumAddress(address.toString("hex"));
  try {
    guessit.initialAccount(data["address"], 0.1); // ToDo be careful;
    //guessdata.saveUserLib(data["address"]);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  } catch (e) {
    log.error(e);
  }
});

app.get("/ava", function (req, res) {
  var n = new Date();
  var handle = function (data) {
    res.setHeader("Content-Type", "application/json");
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
});
//get system version,
//check if need upgrade.
app.get("/ver", function (err, res) {
  log.debug("get backend version:");
  log.debug(JSON.stringify(res.headers));
  var result = {
    version: VERSION,
    game: null
  };
  var handle = function (data) {
    res.setHeader("Content-Type", "application/json");
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
  try {
    var me = req.headers["me"];
    var keyHex = CryptoJS.enc.Utf8.parse(basekey);

    var pla = CryptoJS.DES.decrypt({
        ciphertext: CryptoJS.enc.Base64.parse(me)
      },
      keyHex, {
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.ECB
      }
    );
    var keypair = pla.toString(CryptoJS.enc.Utf8);

    log.debug(keypair);

    if (keypair.length == 0) {
      res.end(
        JSON.stringify({
          result: "no"
        })
      );
    }
    log.debug("get user stat");
    guessdata.getUserStat(keypair.toLowerCase(), function (result) {
      res.setHeader("Content-Type", "application/json");
      res.header("Content-Type", "application/json; charset=utf-8");
      if (result) {
        res.end(
          JSON.stringify({
            result: "ok",
            data: result
          })
        );
      } else {
        res.end(
          JSON.stringify({
            result: "no"
          })
        );
      }
    });
  } catch (e) {
    log.error(e);
    res.end(
      JSON.stringify({
        result: "no"
      })
    );
  }
});


//get day winner info
app.get("/winner", function (req, res) {

  try {
    var me = req.headers["me"];
    var keyHex = CryptoJS.enc.Utf8.parse(basekey);

    var pla = CryptoJS.DES.decrypt({
        ciphertext: CryptoJS.enc.Base64.parse(me)
      },
      keyHex, {
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.ECB
      }
    );
    var keypair = pla.toString(CryptoJS.enc.Utf8);

    log.debug(keypair);

    if (keypair.length == 0) {
      res.end(
        JSON.stringify({
          result: "no"
        })
      );
    }
    var dayinfo = req.headers["dayinfo"];
    log.debug("get winner of day:", dayinfo);
    guessdata.getDayWinner(dayinfo, async function (data) {
      res.setHeader("Content-Type", "application/json");
      res.header("Content-Type", "application/json; charset=utf-8");
      var fetchNickname = async function (addr) {

      }
      if (data) {
        for (var i = 0; i < data.length; i++) {
          try {
            var nick = await guessdata.getNickNameByAddr(data[i].addr);
            if (nick) {
              data[i].nickname = encodeURI(nick.nickname);
            } else {
              data[i].nickname = "";
            }

          } catch (e) {
            data[i].nickname = "";
          }
        }
        log.debug('winnner list:', data);
        res.end(
          JSON.stringify({
            result: "ok",
            data: data
          })
        );
      } else {
        res.end(
          JSON.stringify({
            result: "no"
          })
        );
      }
    });
  } catch (e) {
    log.error(e);
    res.end(
      JSON.stringify({
        result: "no"
      })
    );
  }
});

//get last week winner info
app.get("/winners", async function (req, res) {
  log.debug("get a day winner list:");
  try {
    var me = req.headers["me"];
    var keyHex = CryptoJS.enc.Utf8.parse(basekey);

    var pla = CryptoJS.DES.decrypt({
        ciphertext: CryptoJS.enc.Base64.parse(me)
      },
      keyHex, {
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.ECB
      }
    );
    var keypair = pla.toString(CryptoJS.enc.Utf8);

    if (keypair.length == 0) {
      res.end(
        JSON.stringify({
          result: "no"
        })
      );
    }
    //var dayinfo = req.headers["dayinfo"];
    guessdata.getWinners("nodateneed", async function (data) {
      res.setHeader("Content-Type", "application/json");
      res.header("Content-Type", "application/json; charset=utf-8");
      if (data) {
        for (var i = 0; i < data.length; i++) {
          try {
            var nick = await guessdata.getNickNameByAddr(data[i]._id);
            if (nick) {
              data[i].nickname = encodeURI(nick.nickname);
            } else {
              data[i].nickname = "";
            }

          } catch (e) {
            data[i].nickname = "";
          }
        }
        log.debug('winnner list:', data);
        res.end(
          JSON.stringify({
            result: "ok",
            data: data
          })
        );
      } else {
        res.end(
          JSON.stringify({
            result: "no",
            msg: " no Data"
          })
        );
      }
    });
  } catch (e) {
    log.error(e);
    res.end(
      JSON.stringify({
        result: "no",
        msg: "System error"
      })
    );
  }
});
//get user 总体排行　info
/*app.get("/data/board", function (req, res) {
  try {
    var me = req.headers["me"];
    var keyHex = CryptoJS.enc.Utf8.parse(basekey);

    var pla = CryptoJS.DES.decrypt({
        ciphertext: CryptoJS.enc.Base64.parse(me)
      },
      keyHex, {
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.ECB
      }
    );
    var keypair = pla.toString(CryptoJS.enc.Utf8);

    log.debug(keypair);

    if (keypair.length == 0) {
      res.end(
        JSON.stringify({
          result: "error"
        })
      );
    }
    var dayinfo = req.headers["dayinfo"];
    guessdata.getDayWinner(dayinfo, async function (data) {
      res.setHeader("Content-Type", "application/json");
      res.header("Content-Type", "application/json; charset=utf-8");
      if (data) {
        for (var i = 0; i < data.length; i++) {
          var nick = await guessdata.getNickNameByAddr(data[i].addr);
          data[i].nickname = nick;
        }
        log.info(data);
        res.end(
          JSON.stringify({
            result: "ok",
            data: data
          })
        );
      } else {
        res.end(
          JSON.stringify({
            result: "error"
          })
        );
      }
    });
  } catch (e) {
    log.error(e);
    res.end(
      JSON.stringify({
        result: "error"
      })
    );
  }
});*/

//man to bid on once for a day.
/* input data is header has one parameter, it is addr+private key value, and combine key:
using chain3 sha as verification.
*/
app.post("/play", function (req, res) {
  log.info("User submit guess");
  var me = req.headers["me"];
  var key = req.headers["key"];
  // console.log(me);
  var dd = Date.now();
  var keyHex = CryptoJS.enc.Utf8.parse(basekey);

  var pla = CryptoJS.DES.decrypt({
      ciphertext: CryptoJS.enc.Base64.parse(me)
    },
    keyHex, {
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.ECB
    }
  );
  // console.log(pla.toString(CryptoJS.enc.Utf8));
  var keypair = pla.toString(CryptoJS.enc.Utf8).split(",");
  if (keypair.length != 2) {
    res.end(
      JSON.stringify({
        result: "no",
        msg: "错误！"
      })
    );
    log.error("Someone try to access system");
    return;
  }
  var keyinfo = CryptoJS.DES.decrypt({
      ciphertext: CryptoJS.enc.Base64.parse(key)
    },
    CryptoJS.enc.Utf8.parse(keypair[0]), {
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.ECB
    }
  );
  var keymess = keyinfo.toString(CryptoJS.enc.Utf8);
  //console.log(keymess);
  var keymessinfo = keymess.split(",");
  if (keymessinfo.length != 2) {
    res.end(
      JSON.stringify({
        result: "no",
        msg: "错误！"
      })
    );
    log.error("Someone use bad key");
    return;
  }
  if (keymessinfo[1] != keypair[0]) {
    res.end(
      JSON.stringify({
        result: "no",
        msg: "错误！"
      })
    );
    log.error("Someone try to hack system");
    log.debug(keypair);
    return;
  }
  try {
    if (dd - parseInt(keymessinfo[0]) > 10000) {
      res.end(
        JSON.stringify({
          result: "no",
          msg: "错误！"
        })
      );
      log.debug("Time is not qulified!");
      log.debug(keypair);
      return;
    }
  } catch (e) {
    res.end(
      JSON.stringify({
        result: "no",
        msg: "错误！"
      })
    );
    log.debug("Time format is not correct");
    log.debug(keypair);
    return;
  }

  log.info(
    "Normal user " +
    keypair[0] +
    "  submit to blockchain========================"
  );
  res.setHeader("Content-Type", "application/json");
  res.header("Content-Type", "application/json; charset=utf-8");
  try {
    var si = req.body;
    log.debug(keypair[0], keypair[1]);
    /* guessit.guessByHand(  //call system to submit the bid, input is user sub time, 
       si.name,
       si.point,
       keypair[0],
       keypair[1]
       );*/
    guessit.guessNow(si.point, keypair[0], keypair[1]);
    res.end(
      JSON.stringify({
        result: "ok",
        msg: "提交成功，请过几分钟刷新区块部分查看提交结果！"
      })
    );
    return;
  } catch (e) {
    log.error("input number is error", e);
    res.end(
      JSON.stringify({
        result: "no",
        msg: "提交失败"
      })
    );
  }
});
// allow user to submit suggestion
app.post("suggest", function (err, res) {});

//ToDo
//获取当日和昨日数据，内容为日期，参与人数，奖金池金额，上证收盘，竞猜均值，误差
//输入：用户的addr
app.get("/data/today", function (req, res) {
  log.info("User get today info");
  try {
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
    if (DEBUG == 1) {
      console.log(keypair);
      console.log("get today data");
    }
    if (keypair.length == 0) {
      res.end(JSON.stringify({
        result: "no"
      }));
      return;
    }

    guessdata.getTodayData(async function (result) {
      res.setHeader("Content-Type", "application/json");
      res.header("Content-Type", "application/json; charset=utf-8");
      if (result) {
        var data = [];
        for (var i = 0; i < result.length; i++) {
          log.debug('summary of day:', result[i]);
          var high, low;
          high = result[i].up_high;
          low = result[i].down_low;
          if (result[i].up == 0) { //处理特殊情况，没有预测低的或者高的．
            high = result[i].down_high;
            low = result[i].down_low;
          }
          if (result[i].down == 0) {
            high = result[i].up_high;
            low = result[i].up_low;
          }
          var balance = result[i].balance ? result[i].balance.toString() : 0;
          var contract = await guessdata.getContractByDay(result[i].tradeday);
          data.push({
            tradeday: result[i].tradeday,
            contract: contract,
            shindex: result[i].toidxsh >= 0 ? result[i].toidxsh.toFixed(2) : "",
            total: result[i].total.toString(),
            totalhits: result[i].totalhit.toString(),
            balance: balance,
            up: result[i].up.toString(),
            down: result[i].down.toString(),
            highest: high.toFixed(2),
            lowest: low.toFixed(2),
            average: result[i].average.toFixed(2),
            diff: result[i].diff.toFixed(2)
            // bonus: result[i].bonus,
          });
        }
        log.debug(data);
        res.end(
          JSON.stringify({
            result: "ok",
            data: data
          })
        );
      } else {
        res.end(
          JSON.stringify({
            result: "no"
          })
        );
      }
    });
  } catch (e) {
    log.error(e);
    res.end(
      JSON.stringify({
        result: "no"
      })
    );
  }
});

//获得本期排行,内容为,地址 和积分，按照积分排序
//输入:用户的addr
app.get("/data/board", function (req, res) {
  log.info("get system board");
  var addr;
  try {
    var me = req.headers["me"];
    var keyHex = CryptoJS.enc.Utf8.parse(basekey);

    var pla = CryptoJS.DES.decrypt({
        ciphertext: CryptoJS.enc.Base64.parse(me)
      },
      keyHex, {
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.ECB
      }
    );
    var keypair = pla.toString(CryptoJS.enc.Utf8);

    log.debug(keypair);

    if (keypair.length == 0) {
      res.end(
        JSON.stringify({
          result: "no"
        })
      );
    }
    guessdata.generateUserBillBorad(function (data) {
      // 此处包含nickname 已经做过编码，针对中文
      res.end(
        JSON.stringify({
          result: "ok",
          data: data
        }));
    });
  } catch (e) {
    log.error(e);
    res.end(JSON.stringify({
      result: "no",
      msg: e.toString()
    }));
  }
});

//数据统计　列表包含：日期，参与人数，上证收盘，竞猜均值，误差％
//输入:用户的addr
app.get("/data/history", async function (req, res) {
  log.info("get system history");
  var addr;
  try {
    var me = req.headers["me"];
    var keyHex = CryptoJS.enc.Utf8.parse(basekey);

    var pla = CryptoJS.DES.decrypt({
        ciphertext: CryptoJS.enc.Base64.parse(me)
      },
      keyHex, {
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.ECB
      }
    );
    var keypair = pla.toString(CryptoJS.enc.Utf8);

    //log.debug(keypair);

    if (keypair.length == 0) {
      res.end(
        JSON.stringify({
          result: "no"
        })
      );
    }
    guessdata.getHistory(async function (data) {
      for (var i = 0; i < data.length; i++) {
        if (data[i]) {
          try {

            var nick = await guessdata.getNickNameByAddr(data[i].addr);
            if (nick)
              data[i].nickname = encodeURI(nick.nickname);
            else {
              data[i].nickname = "";
            }
            data[i].average = data[i].average.toFixed(2);
            data[i].shindex = data[i].shindex.toFixed(2);
            data[i].diff = data[i].diff.toFixed(2);
            data[i].bonus = data[i].bonus.toFixed(8);
            data[i].totalhits = data[i].totalhits.toString();
          } catch (e) {
            continue;
          }
        }
      }
      res.end(
        JSON.stringify({
          result: "ok",
          data: data
        }));
    });
  } catch (e) {
    log.error(e);
    res.end(JSON.stringify({
      result: "no",
      msg: e.toString()
    }));
  }
});

//profile: 返回用户使用信息：包含：竞猜日期，上证指数，我猜的点位，排名，奖励
// 统计使用信息　竞猜次数，中奖次数，中奖金额，本期积分
//输入：加密用户的addr + 私玥，参考guess 函数的做法
app.get("/me", function (req, res) {
  log.info("get user profile(me)");
  var addr;
  try {
    var me = req.headers["me"];
    var keyHex = CryptoJS.enc.Utf8.parse(basekey);

    var pla = CryptoJS.DES.decrypt({
        ciphertext: CryptoJS.enc.Base64.parse(me)
      },
      keyHex, {
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.ECB
      }
    );
    var keypair = pla.toString(CryptoJS.enc.Utf8);

    log.debug(keypair);

    if (keypair.length == 0) {
      res.end(
        JSON.stringify({
          result: "no"
        })
      );
    }
    guessdata.generateUserProfile(keypair, function (data) {
      log.debug('get profile and total is ', data.total);
      res.end(
        JSON.stringify({
          result: "ok",
          data: data
        }));
    });
  } catch (e) {
    console.log(e);
    log.error(e);
    res.end(JSON.stringify({
      result: "no",
      msg: e.toString()
    }));
  }
});

//获取最新的赢家
app.get("/latest/winner", function (req, res) {
  var addr;
  try {
    var me = req.headers["me"];
    var keyHex = CryptoJS.enc.Utf8.parse(basekey);

    var pla = CryptoJS.DES.decrypt({
        ciphertext: CryptoJS.enc.Base64.parse(me)
      },
      keyHex, {
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.ECB
      }
    );
    var keypair = pla.toString(CryptoJS.enc.Utf8);
    //log.debug(keypair);
    if (keypair.length == 0) {
      res.end(
        JSON.stringify({
          result: "no"
        })
      );
    }
    //dayinfo = req.headers["dayinfo"];

    log.debug("Get system latest winner", keypair);

    guessdata.getLatestWinner(async function (data) {
      log.debug('system return', data);
      if (data.length >= 0) {
        var ret = data[0];
        if (!ret) {
          res.end(
            JSON.stringify({
              result: "no",
              msg: "没有找到！"
            }));
          return;
        }
        try {
          var nick = await guessdata.getNickNameByAddr(ret.addr);
          if (nick) {
            ret.nickname = encodeURI(nick.nickname);
          } else {
            ret.nickname = "";
          }
        } catch (e) {
          log.debug('get nickname error', e);
        }
        res.end(
          JSON.stringify({
            result: "ok",
            data: ret
          }));
        return;
      } else {
        res.end(
          JSON.stringify({
            result: "no",
            msg: "没有找到！"
          }));
      }
    });
  } catch (e) {
    log.error(e);
    res.end(JSON.stringify({
      result: "no",
      msg: e.toString()
    }));
  }

});

app.get("/latest/bidtoday", function (req, res) {
  var addr;
  try {
    var me = req.headers["me"];
    var keyHex = CryptoJS.enc.Utf8.parse(basekey);

    var pla = CryptoJS.DES.decrypt({
        ciphertext: CryptoJS.enc.Base64.parse(me)
      },
      keyHex, {
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.ECB
      }
    );
    var keypair = pla.toString(CryptoJS.enc.Utf8);
    //log.debug(keypair);
    if (keypair.length == 0) {
      res.end(
        JSON.stringify({
          result: "no"
        })
      );
    }
    //dayinfo = req.headers["dayinfo"];
    var today = new Date();
    log.debug("Get top50 of today");

    guessdata.getDailyTop50(today, async function (data) {
      log.debug('top50 return length:', data.length);
      if (data.length >= 0) {
        var ret = data[0];
        if (!ret) {
          res.end(
            JSON.stringify({
              result: "no",
              msg: "没有找到！"
            }));
          return;
        }
        for (var i = 0; i < data.length; i++) {
          if (data[i]) {
            try {
              var nick = await guessdata.getNickNameByAddr(data[i].addr);
              if (nick)
                data[i].nickname = encodeURI(nick.nickname);
              else {
                data[i].nickname = "";
              }
              data[i].point = data[i].point.toFixed(2);
            } catch (e) {
              continue;
            }
          }
        }
        res.end(
          JSON.stringify({
            result: "ok",
            data: data
          }));
      } else {
        res.end(
          JSON.stringify({
            result: "no",
            data: null
          }));
      }
    });
  } catch (e) {
    log.error(e);
    res.end(JSON.stringify({
      result: "no",
      msg: e.toString()
    }));
  }

});

//查询某日是否获奖
app.get("/bingo", function (req, res) {

  var addr;
  try {
    var me = req.headers["me"];
    var keyHex = CryptoJS.enc.Utf8.parse(basekey);

    var pla = CryptoJS.DES.decrypt({
        ciphertext: CryptoJS.enc.Base64.parse(me)
      },
      keyHex, {
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.ECB
      }
    );
    var keypair = pla.toString(CryptoJS.enc.Utf8);
    //log.debug(keypair);
    if (keypair.length == 0) {
      res.end(
        JSON.stringify({
          result: "error"
        })
      );
    }
    dayinfo = req.headers["dayinfo"];
    log.info("User bingo,", addr, dayinfo);
    if (!dayinfo) {
      res.end(
        JSON.stringify({
          result: "no",
          msg: "wrong format"
        })
      );
      return;
    }
    guessdata.isBingo(keypair, dayinfo, function (data) {
      if (data) {
        var dd;
        if (data.bingo) {
          dd = {
            bingo: true,
            msg: encodeURI("恭喜，大奖,获得了") + data.bonus.toString() + encodeURI("墨客")
          };
        } else if (data.tranking == 1) {
          dd = {
            bingo: true,
            msg: encodeURI("恭喜,把得头筹,获得了") + data.bonus.toString() + encodeURI("墨客")
          };
        } else {
          dd = {
            bingo: true,
            msg: encodeURI("恭喜，第") + data.tranking.toString() + encodeURI("名，再接再厉！")
          };
        }
        res.end(
          JSON.stringify({
            result: "ok",
            data: dd
          }));
        return;
      } else {
        res.end(
          JSON.stringify({
            result: "no",

            msg: encodeURI("没有")

          }));
      }
    });
  } catch (e) {
    log.error(e);
    res.end(JSON.stringify({
      result: "no",
      msg: e.toString()
    }));
  }

});

//设置用户昵称
app.post("/data/nickname", function (req, res) {
  log.debug("keep user nickname");
  try {
    var me = req.headers["me"];
    //log.info(me);
    if (!me) {
      log.info("no require data");
      res.end(JSON.stringify({
        result: "no"
      }));
      return;
    }
    var keyHex = CryptoJS.enc.Utf8.parse(basekey);

    var pla = CryptoJS.DES.decrypt({
        ciphertext: CryptoJS.enc.Base64.parse(me)
      },
      keyHex, {
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.ECB
      }
    );
    var keypair = pla.toString(CryptoJS.enc.Utf8);

    log.debug(keypair);

    if (keypair.length == 0) {
      res.end(
        JSON.stringify({
          result: "error"
        })
      );
    }
    var nickname = decodeURI(req.headers["nickname"]);
    log.debug("nickname is ", nickname);
    if (!nickname) {
      res.end(
        JSON.stringify({
          result: "No enough parameter"
        })
      );
      return;
    }
    var ret = guessdata.saveNickNameByAddr(keypair, nickname);
    if (ret) {
      res.end(
        JSON.stringify({
          result: "ok"
        })
      );
    } else {
      res.end(
        JSON.stringify({
          result: "no"
        })
      );
    }
  } catch (e) {
    log.debug(e);
    res.end(JSON.stringify({
      result: "no"
    }));
  }
});

//get 上一个交易日的收盘价，比如，今天是2018-10-20,调用这个接口，返回了2018-10-19的收盘价
//已单元测试．
app.get("/data/index", async function (err, res) {
  log.info("get index close price:");
  var number = await guessdata.getPreTradeDayIndex(new Date());
  console.log(number);
  if (number) {
    res.end(
      JSON.stringify({
        result: "ok",
        data: number.toFixed(2)
      })
    );
  } else {
    res.end(
      JSON.stringify({
        result: "no",
        msg: "Not avaliable yet"
      })
    );
  }
});


app.post("/transition", function (req, res) {
  log.info("User ask transfer to");
  var me = req.headers["me"];
  var key = req.headers["key"];
  // console.log(me);
  var dd = Date.now();
  var keyHex = CryptoJS.enc.Utf8.parse(basekey);

  var pla = CryptoJS.DES.decrypt({
      ciphertext: CryptoJS.enc.Base64.parse(me)
    },
    keyHex, {
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.ECB
    }
  );
  // console.log(pla.toString(CryptoJS.enc.Utf8));
  var keypair = pla.toString(CryptoJS.enc.Utf8).split(",");
  if (keypair.length != 2) {
    res.end(
      JSON.stringify({
        result: "no",
        msg: "错误！"
      })
    );
    log.error("Someone try to access system");
    return;
  }
  var keyinfo = CryptoJS.DES.decrypt({
      ciphertext: CryptoJS.enc.Base64.parse(key)
    },
    CryptoJS.enc.Utf8.parse(keypair[0]), {
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.ECB
    }
  );
  var keymess = keyinfo.toString(CryptoJS.enc.Utf8);
  //console.log(keymess);
  var keymessinfo = keymess.split(",");
  if (keymessinfo.length != 2) {
    res.end(
      JSON.stringify({
        result: "no",
        msg: "错误！"
      })
    );
    log.error("Someone use bad key");
    return;
  }
  if (keymessinfo[1] != keypair[0]) {
    res.end(
      JSON.stringify({
        result: "no",
        msg: "错误！"
      })
    );
    log.error("Someone try to hack system");
    log.debug(keypair);
    return;
  }
  try {
    if (dd - parseInt(keymessinfo[0]) > 10000) {
      res.end(
        JSON.stringify({
          result: "no",
          msg: "错误！"
        })
      );
      log.debug("Time is not qulified!");
      log.debug(keypair);
      return;
    }
  } catch (e) {
    res.end(
      JSON.stringify({
        result: "no",
        msg: "错误！"
      })
    );
    log.debug("Time format is not correct");
    log.debug(keypair);
    return;
  }
  var toAddr = req.headers["to"];
  var amount = req.headers['amount'];
  log.info(
    "Normal user " +
    keypair[0] +
    "  submit to blockchain========================", toAddr, amount
  );
  res.setHeader("Content-Type", "application/json");
  res.header("Content-Type", "application/json; charset=utf-8");
  try {
    var si = req.body;
    log.debug(keypair[0], keypair[1]);
    /* guessit.guessByHand(  //call system to submit the bid, input is user sub time, 
       si.name,
       si.point,
       keypair[0],
       keypair[1]
       );*/
    guessit.transferTo(keypair[0], keypair[1], toAddr, amount, function (data) {
      res.end(
        JSON.stringify({
          result: "ok",
          msg: data
        }));
    });
    return;
  } catch (e) {
    log.error("proxy :", e);
    res.end(
      JSON.stringify({
        result: "no",
        msg: "提交失败"
      })
    );
  }
});

var server = app.listen(11545, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Guessit service app listening at http://%s:%s", host, port);
});