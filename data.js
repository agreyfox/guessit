var Server = require("mongodb").Server,
  Db = require("mongodb").Db,
  mongo = require("mongodb"),
  MongoClient = require("mongodb").MongoClient,
  ReplSetServers = require("mongodb").ReplSetServers,
  ObjectID = require("mongodb").ObjectID,
  Binary = require("mongodb").Binary,
  GridStore = require("mongodb").GridStore,
  Grid = require("mongodb").Grid,
  Code = require("mongodb").Code;
var async = require("async");
var Guessit = require("./guessit.js");

var log4js = require("log4js");

var log = log4js.getLogger("Data");
log.level = "debug";

const urlNew = new Server("localhost", 27017, {
  native_parser: true
});

const {
  MongoPool,
  clientConnect,
  clientClose
} = require("./dbMongo");

var assert = require("assert");

var weekday = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];
var months = new Array(
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
);
var holidays = new Array(
  "2018-9-24",
  "2018-9-22",
  "2018-9-23",
  "2018-10-1",
  "2018-10-2",
  "2018-10-3",
  "2018-10-4",
  "2018-10-5",
  "2018-10-6"
);

var DBName = "guessit"; //collective name
var MarketDays = "marketdays"; //市场合约
var GuessLog = "guesslog"; //投注记录
var Records = "records"; //统计记录
var UserBonus = "bonuslog";
var UserProfile = "users";
var BatchSize = 5000;
var BaseBonus = 50;

var url = "mongodb://localhost:27017/";

var startdate = "2018-10-01";

Date.prototype.getMonthName = function () {
  return months[this.getMonth()];
};
Date.prototype.getDayName = function () {
  return days[this.getDay()];
};
Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

Date.prototype.yyyymmdd = function () {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [
    this.getFullYear(),
    (mm > 9 ? "" : "0") + mm,
    (dd > 9 ? "" : "0") + dd
  ].join("");
};

//*************************************======Some command function */

var isHolidy = function (one) {
  var target = one;
  for (var j = 0; j < holidays.length; j++) {
    var item = new Date(holidays[j]);
    if (target == item) {
      console.log("is holidy:" + one.toDateString());
      return true;
    }
  }
  return false;
};
// 格式化日期时间，从九点开始算，
//下一天的时间上海本地时间，当前所有大于九点是获得的竞猜日算作下一天
var formatTime = function (t) {
  var ret = t;
  ret.setHours(9);
  ret.setMinutes(0);
  ret.setSeconds(0);
  ret.setMilliseconds(0);
  return ret;
};

function parse(str) {
  var y = str.substr(0, 4),
    m = str.substr(4, 2) - 1,
    d = str.substr(6, 2);
  var D = new Date(y, m, d);
  return D.getFullYear() == y && D.getMonth() == m && D.getDate() == d ?
    D :
    "invalid date";
}

function isSameDay(date1, date2) {
  try {
    if (
      date1.getMonth() == date2.getMonth() &&
      date1.getFullYear() == date2.getFullYear() &&
      date1.getDate() == date2.getDate()
    ) {
      log.debug("日期相符");
      return true;
    } else {
      return false;
    }
  } catch (e) {
    log.error(e);
    return false;
  }
}

//判断dateobject 是否为交易日
function isTradeDay(dateObject) {
  if (
    dateObject.getDay() == 6 ||
    dateObject.getDay() == 0 ||
    isHolidy(dateObject)
  ) {
    console.log("不是交易日");
    return false;
  }
  if (holidays.indexOf(dateObject.toLocaleDateString()) >= 0) {
    console.log("节假日");
    return false;
  }
  return true;
}

//获取交易日前一个交易日, 输入格式为2010-10-01
function getPreTradeDay(adate) {
  var dateInstance = new Date(adate);
  var checkTradeDay = dateInstance.addDays(-1);
  while (!isTradeDay(checkTradeDay)) {
    checkTradeDay = checkTradeDay.addDays(-1);
    if (isSameDay(checkTradeDay, new Date("2018-01-01"))) {
      log.Debug("没找到交易日期记录");
      return false;
    }
  }
  return checkTradeDay;
}
//获取交易日前一个交易日, 输入格式为2010-10-01
function getNextTradeDay(adate) {
  var count = 0;
  var dateInstance = new Date(adate);
  var checkTradeDay = dateInstance.addDays(1);
  while (!isTradeDay(checkTradeDay)) {
    checkTradeDay = checkTradeDay.addDays(1);
    count = count + 1;
    if (count > 60) {
      log.error("没找到交易日期记录!");
      return false;
    }
  }
  return checkTradeDay;
}

//**************************************************************** */
module.exports = {
  getOpenDay: async function (ti, cbb) {
    var dt = new Date(ti);
    let client;
    try {
      if (!isTradeDay(dt)) {
        dt = getNextTradeDay(dt); //如果今天不是交易日，获取下一个交易日的内容
      }
      // Use connect method to connect to the Server
      client = await MongoClient.connect(new Server("localhost", 27017));
      const db = client.db("guessit");
      var myPromise = () => {
        // /console.log("query today")
        return new Promise((resolve, reject) => {
          db.collection(MarketDays)
            .find({
              openday: dt.yyyymmdd() //获取今天的合约
            })
            .sort("openday", 1)
            .limit(1)
            .toArray(function (err, data) {
              err ? reject(err) : resolve(data);
            });
        });
      };

      //Step 2: async promise handler
      var callMyPromise = async () => {
        var result = await myPromise();
        return result;
      };

      //Step 3: make the call
      callMyPromise().then(function (result) {
        // client.close();
        cbb(result);
      });
    } catch (e) {
      console.log(e);
      log.error(e);
    }
    if (client) {
      client.close();
    }
  },

  //获取指定日期的合约内容, 如指定日期不是交易日，也不会自动跳转
  getDayItem: async function (ti) {
    let promise = new Promise(async function (resolve, reject) {
      var dt = new Date(ti);
      let client;
      try {
        // Use connect method to connect to the Server
        client = await MongoClient.connect(new Server("localhost", 27017));
        const db = client.db("guessit");
        var myPromise = () => {
          return new Promise((res, rej) => {
            db.collection(MarketDays)
              .find({
                openday: dt.yyyymmdd() //获取指定日期的合约
              })
              .sort("openday", 1)
              .limit(1)
              .toArray(function (err, data) {
                //返回一个
                log.debug("data");
                err ? rej(err) : res(data);
              });
          });
        };

        //Step 2: async promise handler
        var callMyPromise = async () => {
          var result = await myPromise();
          return result;
        };

        //Step 3: make the call
        callMyPromise().then(function (result) {
          // console.log(result);
          retValue = result;
          resolve(retValue);
        });
      } catch (e) {
        log.error(e);
        reject(e);
      } finally {
        client.close();
      }
    });
    return promise;
  },

  //根据ｂｉｄ名称获取ｃｏｎｔｒａｃｔ
  getContractByName: async function (name, cbb) {
    let client;
    try {
      // Use connect method to connect to the Server
      client = await MongoClient.connect(new Server("localhost", 27017));

      const db = client.db("guessit");
      var myPromise = () => {
        return new Promise((resolve, reject) => {
          db.collection(MarketDays)
            .find({
              name: name
            })
            .limit(1)
            .toArray(function (err, data) {
              log.debug(data);
              err ? reject(err) : resolve(data);
            });
        });
      };

      //Step 2: async promise handler
      var callMyPromise = async () => {
        var result = await myPromise();
        return result;
      };

      //Step 3: make the call
      callMyPromise().then(function (result) {
        cbb(result);
      });
    } catch (e) {
      log.error(e);
    }
    if (client) {
      client.close();
    }
  },

  getContractByDay: async function (dayinfo) {
    return new Promise(async (resolve, reject) => {
      var retvalue;
      let client;
      try {
        // Use connect method to connect to the Server
        client = await MongoClient.connect(new Server("localhost", 27017));

        const db = client.db("guessit");
        var getContract = async function (dayinfo) {
          return new Promise((res, rej) => {
            log.debug(dayinfo);
            try {
              db.collection(MarketDays)
                .find({
                  openday: dayinfo
                })
                .limit(1)
                .toArray(function (err, data) {
                  log.debug("found a record contract", data);
                  err ? res("") : res(data[0].contract);
                });
            } catch (e) {
              console.log(e);
              log.debug(e);
            }
          });
        };
        retvalue = await getContract(dayinfo);
      } catch (e) {
        log.error(e);
      }
      if (client) {
        client.close();
        resolve(retvalue);
      }
    });
  },

  //根据ａｄｄｒ获取用户提交内容
  getSubmit: async function (addr, cbb) {
    var dt = new Date(ti);
    let client;

    try {
      // Use connect method to connect to the Server
      client = await MongoClient.connect(new Server("localhost", 27017));

      const db = client.db("guessit");
      var myPromise = () => {
        return new Promise((resolve, reject) => {
          db.collection(GuessLog)
            .find({
              openday: dt.yyyymmdd()
            })
            .sort("openday", 1)
            .limit(1)
            .toArray(function (err, data) {
              log.debug(data);
              err ? reject(err) : resolve(data);
            });
        });
      };

      //Step 2: async promise handler
      var callMyPromise = async () => {
        var result = await myPromise();
        return result;
      };

      //Step 3: make the call
      callMyPromise().then(function (result) {
        // client.close();
        cbb(result);
      });
    } catch (e) {
      log.error(e);
    }
    if (client) {
      client.close();
    }
  },

  //从ｓｄ开始创建开始记录，长度为duration days,
  //所有标记时间均为9:00开始，
  createMarketDay_batch: async function (sd, duration) {
    var mydate = new Date(sd);
    MongoClient.connect(
      urlNew,
      async function (err, dbc) {
        assert.equal(null, err);
        var p = await new Promise(function (resolve, reject) {
          var db = dbc.db(DBName);
          for (var i = 0; i < duration; i++) {
            //mydate.setDate(mydate.getDate() + 1);
            var me = new Date(sd).addDays(i);
            //设置为分界线为9：０：０
            // console.log(me);
            if (me.getDay() == 6 || me.getDay() == 0 || isHolidy(me)) {
              continue;
            }
            if (holidays.indexOf(me.toLocaleDateString()) >= 0) {
              continue;
            }
            var marketDay = {
              openday: me.yyyymmdd(),
              name: "",
              created: false,
              contract: "",
              result: {},
              total: 0
            };
            log.debug(me);
            db.collection(MarketDays).insertOne(marketDay, function (
              err,
              result
            ) {
              assert.equal(null, err);
              log.debug("insert One market record:");
            });
            log.debug("插入一条开市记录:" + mydate.toDateString());
          }
          resolve(db);
        });
        log.debug("Finished Create data record");
        dbc.close();
      }
    );
  },

  //创建一个交易日记录
  //sd, 内容：日期 date:20101010,name:上证1002, target:类型
  createOneMarketRecord: async function (sd) {
    var mydate = new Date(parse(sd.date));

    if (mydate.getDay() == 6 || mydate.getDay() == 0 || isHolidy(mydate)) {
      log.info("不是交易日", mydate);
      return false;
    }
    if (holidays.indexOf(mydate.toLocaleDateString()) >= 0) {
      log.info("节假日", mydate);
      return false;
    }
    try {
      // Use connect method to connect to the Server
      client = await MongoClient.connect(new Server("localhost", 27017));

      const db = client.db("guessit");
      var myPromise = () => {
        return new Promise((resolve, reject) => {
          var query = {
            openday: sd.date,
            name: sd.name,
            target: sd.target
          };
          var marketDay = {
            openday: sd.date,
            name: sd.name,
            target: sd.target,
            created: false,
            contract: "",
            result: {},
            total: 0
          };
          db.collection(MarketDays).replaceOne(
            query,
            marketDay, {
              upsert: true
            },
            function (err, result) {
              assert.equal(null, err);
              log.debug(result);
              err ? reject(err) : resolve(result);
            }
          );
        });
      };

      //Step 2: async promise handler
      var callMyPromise = async () => {
        var result = await myPromise();
        return result;
      };
      //Step 3: make the call
      callMyPromise().then(function (result) {
        log.debug("成功创建" + sd.date + "记录");
      });
    } catch (e) {
      log.error(e);
    } finally {
      if (client) {
        client.close();
      }
      return true;
    }
  },

  //获得下一个交易日, t is milionsecond
  getNextAvaiableOpenDay: async function (t, next, callback) {
    var dd = new Date(t);
    if (next) {
      dd = dd.addDays(1);
    }
    var range = 2; //返回今天和下一个交易日的内容
    //dd = formatTime(dd);
    var client;
    try {
      client = await MongoClient.connect(new Server("localhost", 27017));

      const db = client.db(DBName);
      var query = {
        openday: {
          $gte: dd.yyyymmdd()
        }
      };
      log.debug(query);
      var myPromise = () => {
        return new Promise((resolve, reject) => {
          log.debug("do query next :" + query.toString());
          db.collection(MarketDays)
            .find(query)
            .limit(2)
            .sort("openday", 1)
            .toArray(function (err, result) {
              var value;
              if (!err) {
                if (result.length > 0) {
                  // console.log(result);
                  resolve(result);
                } else {
                  reject(err);
                }
              } else {
                reject(err);
              }
            });
        });
      };
      //Step 2: async promise handler
      var callMyPromise = async () => {
        var result = await myPromise();
        return result;
      };

      //Step 3: make the call
      callMyPromise().then(function (result) {
        // client.close();
        callback(result);
      });
    } catch (e) {
      log.error(e);
    } finally {
      client.close();
    }
  },

  //获取下一天的交易合约记录
  getNextTradeDayContract: async function (t, next, callback) {
    var dd = new Date(t);
    if (next) {
      dd = dd.addDays(1);
    }
    var range = 1; //返回今天和下一个交易日的内容
    //dd = formatTime(dd);
    var client;
    try {
      client = await MongoClient.connect(new Server("localhost", 27017));

      const db = client.db(DBName);
      var query = {
        openday: {
          $gte: dd.yyyymmdd()
        }
      };
      log.debug(query);
      var myPromise = () => {
        return new Promise((resolve, reject) => {
          log.debug("do query next :" + query.toString());
          db.collection(MarketDays)
            .find(query)
            .limit(range)
            .sort("openday", 1)
            .toArray(function (err, result) {
              var value;
              if (!err) {
                if (result.length > 0) {
                  // console.log(result);
                  resolve(result);
                } else {
                  reject(err);
                }
              } else {
                reject(err);
              }
            });
        });
      };
      //Step 2: async promise handler
      var callMyPromise = async () => {
        var result = await myPromise();
        return result;
      };

      //Step 3: make the call
      callMyPromise().then(function (result) {
        // client.close();
        callback(result);
      });
    } catch (e) {
      log.error(e);
    } finally {
      client.close();
    }
  },

  // TODO , need to update the database base on address , name
  //记录不存在，就插入，存在就更新, 用户预测行为保存
  keepData: async function (timestamp, blocknunber, tx, addr, name, point) {
    var ti = new Date();
    try {
      client = await MongoClient.connect(new Server("localhost", 27017));

      const db = client.db("guessit");
      var query = {
        //bidtime: ti.yyyymmdd(),
        //timestamp: timestamp,
        addr: addr,
        name: name,
        point: parseFloat(point)
      };
      var guesslog = {
        $set: {
          bidtime: ti.yyyymmdd(),
          ctime: Date.now(),
          timestamp: timestamp,
          name: name,
          tx: tx,
          block: blocknunber,
          point: parseFloat(point),
          addr: addr,
          archive: 0
        }
      };
      var myPromise = () => {
        return new Promise(async (resolve, reject) => {
          try {
            const col = db.collection(GuessLog);
            //var bulk = col.initializeOrderedBulkOp();
            var matchUpdate = {
              bidtime: ti.yyyymmdd(),
              addr: addr,
              name: name
            };
            col.bulkWrite(
              [{
                  updateMany: {
                    filter: matchUpdate,
                    update: {
                      $set: {
                        archive: 1
                      }
                    },
                    upsert: false
                  }
                },
                {
                  updateOne: {
                    filter: query,
                    update: guesslog,
                    upsert: true
                  }
                }
              ], {
                ordered: true,
                w: 1
              },
              function (err, result) {
                //assert.equal(null, err);
                if (!err) {
                  log.debug(result);
                  resolve(result);
                } else {
                  log.error(err);
                  resolve(false);
                }
              }
            );
          } catch (e) {
            log.error(e);
          }
          /* bulk.execute(function(err, result) {
                                                          assert.equal(null, err);
                                                          err ? reject(err) : resolve(result);
                                                      });*/
        });
      };
      //Step 2: async promise handler
      var callMyPromise = async () => {
        var result = await myPromise();
        return result;
      };

      //Step 3: make the call
      callMyPromise().then(function (result) {
        // client.close();
        // console.log(result);
      });
    } catch (e) {} finally {
      client.close();
    }
  },

  // collect the user status
  getUserStat: async function (addr, callback) {
    console.log("Get user submit log!");
    var ti = new Date();
    try {
      client = await MongoClient.connect(new Server("localhost", 27017));
      const db = client.db("guessit");
      var query = {
        addr: addr.toLowerCase() //注意小写
      };
      var myPromise = () => {
        return new Promise((resolve, reject) => {
          db.collection("guesslog")
            .find(query)
            .project({
              _id: 0,
              tx: 1,
              point: 1,
              timestamp: 1
            })
            .sort("timestamp", -1)
            .limit(8)
            .toArray(function (err, result) {
              assert.equal(null, err);
              log.debug(result);
              resolve(result);
            });
        });
      };
      //Step 2: async promise handler
      var callMyPromise = async () => {
        var result = await myPromise();
        return result;
      };

      //Step 3: make the call
      callMyPromise().then(function (result) {
        //console.log(result);
        callback(result);
      });
    } catch (e) {
      log.error(e);
    } finally {
      client.close();
    }
  },

  // 根据openday, name,和target 保存合约地址
  setContract: function (dat, name, target, addr) {
    var dd;
    dd = parse(dat);
    log.debug("input date type is ", typeof dd.toString());
    if (typeof dd == "string") {
      dd = new Date(dat);
    }
    log.debug(dd);
    MongoClient.connect(
      urlNew,
      function (err, dbc) {
        assert.equal(null, err);
        var db = dbc.db(DBName);
        var updateQuey = {
          openday: dd.yyyymmdd()
        };
        log.debug("update contract:" + dd.yyyymmdd());
        db.collection("marketdays").findOneAndUpdate(
          updateQuey, {
            $set: {
              contract: addr,
              created: true,
              name: name,
              target: target
            }
          },
          function (err, result) {
            assert.equal(null, err);
            //console.log(result);
            dbc.close();
          }
        );
        // console.log("插入一条开市记录:" + mydate.toDateString());
      }
    );
  },

  //update the contract content，在主机上创建的数据库marketday记录先，再保存
  //否则无法保存．
  updateContract: async function (data) {
    try {
      // Use connect method to connect to the Server
      client = await MongoClient.connect(new Server("localhost", 27017));

      const db = client.db("guessit");
      var myPromise = () => {
        return new Promise((resolve, reject) => {
          var updateQuey = {
            name: data.name,
            target: data.target
          };
          log.debug("try to update contract:" + data.name);
          db.collection("marketdays").findOneAndUpdate(
            updateQuey, {
              $set: {
                contract: data.addr,
                created: true,
                name: data.name,
                target: data.target
              }
            }, {
              upsert: false
            }, //no upsert
            function (err, result) {
              assert.equal(null, err);
              err ? reject(err) : resolve(result);
            }
          );
        });
      };

      //Step 2: async promise handler
      var callMyPromise = async () => {
        var result = await myPromise();
        return result;
      };
      //Step 3: make the call
      callMyPromise().then(function (result) {
        log.info("update " + data.name + " done!");
      });
    } catch (e) {
      log.error(e);
    } finally {
      if (client) {
        client.close();
      }
    }
  },

  //normally , this will run only once at 13:10; for records collective
  //
  createOneRecord: async function (indexnumber, dateinfo) {
    log.debug(indexnumber, dateinfo);
    var mydate = new Date(dateinfo);
    var nextAvailabaleDay = getNextTradeDay(mydate); // mydate.addDays(+1);
    log.debug("Create The trade day record at  :", nextAvailabaleDay);
    var client;
    try {
      // Use connect method to connect to the Server
      client = await MongoClient.connect(new Server("localhost", 27017));
      const db = client.db("guessit");
      var create = async function () {
        return new Promise((resolve, reject) => {
          var initialRecord = {
            $set: {
              tradeday: nextAvailabaleDay.yyyymmdd(),
              contract: "",
              fromidxsh: parseFloat(indexnumber),
              toidxsh: 0.0,
              total: 0,
              up: 0,
              down: 0,
              up_low: 0.0,
              up_high: 0.0,
              down_low: 0.0,
              down_high: 0.0,
              caculated: false,
              contract: "",
              result: {},
              totalhits: 0,
              average: 0.0,
              diff: 0.0,
              address: {},
              ready: false
            }
          };
          db.collection(Records).findOneAndUpdate({
              //need to update not replace
              tradeday: nextAvailabaleDay.yyyymmdd()
            },
            initialRecord, {
              upsert: true
            },
            function (err, result) {
              err ? reject(err) : resolve(result);
            }
          );
        });
      };
      var info = await create();
      log.debug(info);
    } catch (e) {
      log.error(e);
    } finally {
      client.close();
    }
  },

  //update dateinfo index number of close
  //更新ｄａｔｅｉｎｆｏ的收盘价并设置可分析标志
  updateRecord: async function (todayindexnumber, yesterdayindex, dateinfo) {
    var mydate = new Date(dateinfo);
    log.info("Update  The trade day record at:", mydate);
    var client;
    try {
      // Use connect method to connect to the Server
      client = await MongoClient.connect(new Server("localhost", 27017));
      const db = client.db("guessit");
      var update = async function () {
        return new Promise(async (resolve, reject) => {
          var updatesql = {
            $set: {
              tradeday: mydate.yyyymmdd(),
              contract: "",
              fromidxsh: parseFloat(yesterdayindex),
              toidxsh: parseFloat(todayindexnumber),
              caculated: false,
              ready: true
            }
          };
          //log.debug(updatesql);
          await db.collection(Records).findOneAndUpdate({
              tradeday: mydate.yyyymmdd()
            },
            updatesql, {
              upsert: true
            },
            function (err, result) {
              log.debug(result);
              err ? reject(err) : resolve(result);
            }
          );
        });
      };
      var info = await update();
      return info;
    } catch (e) {
      log.error(e);
    } finally {
      client.close();
      return;
    }
  },

  //根据合约名称获取地址
  getNickNameByAddr: async function (name) {
    return new Promise(async (resolve, reject) => {
      if (undefined == name || null == name || 0 == name.length) {
        resolve("");
      }
      var retvalue;
      var client;
      try {
        // Use connect method to connect to the Server
        client = await MongoClient.connect(new Server("localhost", 27017));
        const db = client.db("guessit");
        if (typeof name == "string") {
          addr = name.toLowerCase(); //转换为小写
        } else {
          addr = name;
        }

        var findname = async function () {
          return new Promise(async (ress, rejj) => {
            db.collection(UserProfile)
              .find({
                addr: addr //查询用户钱包地址
              })
              .limit(1)
              .project({
                _id: 0,
                nickname: 1
              })
              .next(function (err, result) {
                //console.log(result);
                if (result) {
                  ress(result);
                } else {
                  rejj(""); //没有或失败，就返回空
                }
              });
          });
        };
        retvalue = await findname();
      } catch (e) {
        log.error(e);
        reject(e);
      } finally {
        client.close();
        resolve(retvalue);
      }
    });
  },

  getLatestWinner: async function (callback) {
    return new Promise(async (resolve, reject) => {
      var retvalue;
      var client;
      try {
        // Use connect method to connect to the Server
        client = await MongoClient.connect(new Server("localhost", 27017));
        const db = client.db("guessit");
        var getWinner = async function (dayinfo) {
          return new Promise((res, rej) => {
            try {
              db.collection(UserBonus)
                .find({
                  $or: [{
                      tranking: 1
                    },
                    {
                      bingo: {
                        $gt: 0
                      }
                    }
                  ]
                })
                .limit(1)
                .sort({
                  tradeday: -1
                })
                .project({
                  _id: 0
                })
                .toArray(function (err, result) {
                  if (!err) {
                    res(result);
                  } else {
                    res(null);
                  }
                });
            } catch (e) {
              console.log(e);
              log.error(e);
              throw "no data";
            }
          });
        };
        var data = await getWinner();
        callback(data);
      } catch (e) {
        console.log(e);
        log.error(e);
      } finally {
        client.close();
        resolve(1);
      }
    });
  },

  //获得总的赢家列表
  getWinners: async function (dayinfo, callback) {
    var retvalue;
    var client;
    try {
      // Use connect method to connect to the Server
      client = await MongoClient.connect(new Server("localhost", 27017));
      const db = client.db("guessit");
      var getWinner = async function (dayinfo) {
        return new Promise((resolve, reject) => {
          //log.debug(dayinfo.yyyymmdd());
          db.collection(UserBonus)
            .aggregate([{
                $group: {
                  _id: "$addr",
                  totalbonus: {
                    $sum: "$bonus"
                  }
                }
              },
              {
                $sort: {
                  totalbonus: -1
                }
              },
              {
                $match: {
                  totalbonus: {
                    $gt: 0
                  }
                } //获得过奖金的
              },
              {
                $limit: 50
              }
            ])
            .toArray(function (err, result) {
              console.log("winner list", result);
              if (result) {
                resolve(result);
              } else {
                reject(err);
              }
            });
        });
      };
      var data = await getWinner(dayinfo);
      //log.info(data);
      callback(data);
      retvalue = data;
    } catch (e) {
      log.error(e);
    } finally {
      client.close();
      return;
    }
  },

  //日期格式为20181010,获取每日赢家，并调用回调函数
  getDayWinner: async function (dayinfo, callback) {
    if (!dayinfo) {
      log.debug("input dayinfo empty");
      callback([]);
      return;
    }
    var dateInput;
    try {
      dateInput = parse(dayinfo);
      if (!isTradeDay(dateInput)) {
        dateInput = getPreTradeDay(dateInput); //若本日不是交易日，区最近的
      }
    } catch (e) {
      log.debug("输入日期错误", e);
      return;
    }
    log.debug("get winner for day:", dateInput.yyyymmdd());

    var retvalue;
    var client;
    try {
      // Use connect method to connect to the Server
      client = await MongoClient.connect(new Server("localhost", 27017));
      const db = client.db("guessit");
      var getWinner = async function (dayinfo) {
        return new Promise((resolve, reject) => {
          log.debug(dayinfo);
          try {
            db.collection(UserBonus)
              .find({
                tradeday: dayinfo,
                $or: [{
                    tranking: 1
                  },
                  {
                    bingo: {
                      $gt: 0
                    }
                  }
                ]
              })
              .limit(50)
              .sort({
                tradeday: 1
              })
              .toArray(function (err, result) {
                //console.log(123);
                log.debug(result);
                resolve(result);
                //console.log(223);
              });
          } catch (e) {
            //console.log(e);
            log.error(e);
          }
        });
      };

      var data = await getWinner(dateInput.yyyymmdd());
      console.log(data);
      callback(data);
      //console.log("aaaaa");
    } catch (e) {
      console.log(e);
      log.error(e);
    } finally {
      client.close();
      return;
    }
  },

  //合法用户获取今天和昨天数据，并执行回调函数
  getTodayData: async function (callback) {
    var retvalue;
    var client;
    try {
      // Use connect method to connect to the Server
      client = await MongoClient.connect(new Server("localhost", 27017));

      const db = client.db("guessit");
      //获取分析表数据判断是否可以执行分析，字段ready为ｔｒｕｅ
      var nowday = new Date();
      var getData = async function (dayinfo) {
        return new Promise((resolve, reject) => {
          log.debug(dayinfo.yyyymmdd());
          db.collection(Records)
            .find({
              tradeday: {
                $lte: dayinfo.yyyymmdd()
              }
            })
            .limit(2)
            .sort({
              tradeday: -1
            })
            .toArray(function (err, result) {
              //console.log(result);
              if (result) {
                resolve(result);
              } else {
                reject(err);
              }
            });
        });
      };
      retvalue = await getData(nowday);
      callback(retvalue);
    } catch (e) {
      log.error(e);
      return null;
    } finally {
      client.close();
    }
  },

  //返回前一个交易日的收盘价
  getPreTradeDayIndex: async function (dateinfo) {
    var retvalue;
    var client;
    try {
      // Use connect method to connect to the Server
      client = await MongoClient.connect(new Server("localhost", 27017));

      const db = client.db("guessit");
      //获取分析表数据判断是否可以执行分析，字段ready为ｔｒｕｅ
      var nowday = new Date(dateinfo);

      var getIndexData = async function (dayinfo) {
        return new Promise((resolve, reject) => {
          log.debug("get pre close data:", dayinfo.yyyymmdd());
          try {
            db.collection(Records)
              .find({
                tradeday: dayinfo.yyyymmdd()
              })
              .limit(1)
              .next(function (err, result) {
                if (err == null) {
                  //assert(err,null)
                  log.debug(result);
                  if (result) {
                    resolve(result);
                  } else {
                    reject(err);
                  }
                } else {
                  resolve(null);
                }
              });
          } catch (e) {
            log.error(e);
            reject(e);
          }
        });
      };
      nowday = getPreTradeDay(nowday);
      // console.log(1);
      var nn = await getIndexData(nowday);
      //console.log(2);
      retvalue = nn.toidxsh;
    } catch (e) {
      log.error(e);
      retvalue = null;
    } finally {
      client.close();
      return retvalue;
    }
  },
  //每天参与竞猜的都会获得５０积分
  setBaseBonus: async function (ti) {
    var mydate;
    log.debug("Set Base bonus .....");
    try {
      mydate = new Date(parse(ti));
      //var yesterday = getPreTradDay(mydate);
    } catch (e) {
      log.error(e); //若给定参数错误，退出
      return;
    }
    if (!isTradeDay(mydate)) {
      log.debug("Not trade day,Exit");
      return;
    }
    var client;

    try {
      // Use connect method to connect to the Server
      client = await MongoClient.connect(new Server("localhost", 27017));
      const db = client.db("guessit");
      var getInfo = async function (dayinfo) {
        return new Promise((resolve, reject) => {
          db.collection(Records)
            .find({
              tradeday: dayinfo.yyyymmdd()
            })
            .limit(1)
            .next(function (err, result) {
              console.log(result);
              if (result) {
                resolve(result);
              } else {
                reject(err);
              }
            });
        });
      };
      var info = await getInfo(mydate);

      if (!info.ready) {
        log.debug("not ready for caculate");
        client.close();
        return false;
      }
      if (info.fromidxsh <= 0 || info.toidxsh <= 0) {
        log.error("市场指数数据");
        throw "no enough data";
      }
      var baseIndex = info.fromidxsh.toFixed(2);
      var targetIndex = info.toidxsh.toFixed(2);

      var getName = async function () {
        //获取当前总投次数
        return new Promise((resolve, reject) => {
          db.collection(MarketDays)
            .find({
              openday: mydate.yyyymmdd()
            })
            .limit(1)
            .project({
              contract: 1,
              name: 1
            })
            .next(function (err, result) {
              //assert.equal(null, err);
              //assert.ok(result != null);
              err ? reject(err) : resolve(result);
            });
        });
      };
      // 根据日期获得交易名称和合约地址
      var nameInfo = await getName();
      var contractName = nameInfo.name;
      var contractAddr = nameInfo.contract;

      // var batch = db.collection(UserBonus).initializeUnorderedBulkOp();
      //获取分析表数据判断是否可以执行分析，字段ready为ｔｒｕｅ
      var updateSignScore = async function () {
        return new Promise(async (resolve, reject) => {
          try {
            await db
              .collection(GuessLog)
              .aggregate([{
                  $match: {
                    name: contractName,
                    archive: 0
                  }
                },
                {
                  $project: {
                    name: 1,
                    addr: 1,
                    timestamp: 1,
                    _id: 0,
                    point: 1
                  }
                },
                {
                  $addFields: {
                    bonus: 0,
                    score: BaseBonus,
                    shindex: targetIndex,
                    tradeday: mydate.yyyymmdd()
                  }
                }
              ])
              .toArray(async function (err, data) {
                log.debug("get the data ", data);
                if (!err) {
                  // no erro then start insert
                  try {
                    var inclient = await MongoClient.connect(
                      new Server("localhost", 27017)
                    );
                    const indb = inclient.db("guessit");
                    const col = indb.collection(UserBonus);
                    var bulk = col.initializeOrderedBulkOp();
                    bulk
                      .find({
                        name: contractName
                      })
                      .delete();
                    log.debug(
                      "update base score , delete all with name ",
                      contractName
                    );
                    log.debug("now add ", data.length, " record in to db");
                    for (var i = 0; i < data.length; i++) {
                      //log.debug(data[i]);
                      bulk.insert(data[i], {
                        w: 1
                      });
                    }
                    await bulk.execute(function (err, data) {
                      log.debug("error: ", err);
                      log.debug("bulk write:", data);
                      inclient.close();
                      resolve(data);
                    });
                  } catch (e) {
                    console.log(e);
                    log.debug(e);
                    reject(e);
                  }
                }
              });
          } catch (e) {
            console.log(e);
            log.error(e);
          } finally {
            //resolve(true);
          }
        });
      };
      var ress = await updateSignScore();
      if (ress) {
        log.debug("更新基础score完毕"); //阳光普找参与奖
      }
    } catch (e) {
      console.log(e);
      log.debug(e);
    } finally {
      client.close();
    }
  },

  //计算每日结果,ti为唯一日期字串对应于tradeday 20110101这样
  /*包括最高值，用户重复提交的应该不计算在内，有ａｒｃｈｉｖｅ标志
          批处理有效投注archive:0的记录
          １获取所有投注次数，更新
          ２获取有效投注次数，更新
          ３批处理5000条，排序，统计差值为负数的，正数个个数，最大，最小值
          ４计算和目标最接近的地址，
          ５更新记录表示计算完成
          */
  caculate: async function (ti) {
    var mydate;
    var guessit = require("./guessit.js");
    log.debug("Let start caculation.....");
    try {
      mydate = new Date(parse(ti));
      //var yesterday = getPreTradDay(mydate);
      log.debug("Now we caculate tradeday: " + mydate.toDateString());
    } catch (e) {
      log.error(e); //若给定参数错误，退出
      return;
    }
    if (!isTradeDay(mydate)) {
      log.debug("Not trade day,Exit");
      return;
    }
    var client;
    try {
      // Use connect method to connect to the Server
      client = await MongoClient.connect(new Server("localhost", 27017));
      const db = client.db("guessit");
      //获取分析表数据判断是否可以执行分析，字段ready为ｔｒｕｅ

      var getInfo = async function (dayinfo) {
        return new Promise((resolve, reject) => {
          db.collection(Records)
            .find({
              tradeday: dayinfo.yyyymmdd()
            })
            .limit(1)
            .next(function (err, result) {
              console.log(result);
              if (result) {
                resolve(result);
              } else {
                reject(err);
              }
            });
        });
      };
      var info = await getInfo(mydate);
      log.debug(info.name);
      if (!info.ready) {
        log.debug("not ready for caculate");
        client.close();
        return false;
      }
      if (info.fromidxsh <= 0 || info.toidxsh <= 0) {
        log.error("指数数据不全，不能计算");
        throw "no index number";
        //return false;
      }
      var baseIndex = info.fromidxsh.toFixed(2);
      var targetIndex = info.toidxsh.toFixed(2);
      var Diff = targetIndex - baseIndex; //实际涨跌
      log.info("last index diff is ", Diff, baseIndex, targetIndex);
      // console.log(baseIndex, targetIndex, diff);
      // 获取总投注数
      var getName = async function () {
        //获取当前总投次数
        return new Promise((resolve, reject) => {
          db.collection(MarketDays)
            .find({
              openday: mydate.yyyymmdd()
            })
            .limit(1)
            .project({
              contract: 1,
              name: 1
            })
            .next(function (err, result) {
              //assert.equal(null, err);
              //assert.ok(result != null);
              err ? reject(err) : resolve(result);
            });
        });
      };
      // 根据日期获得交易名称和合约地址
      var nameInfo = await getName();
      var contractName = nameInfo.name;
      var contractAddr = nameInfo.contract;

      log.debug("current contract addr is " + contractAddr);
      var getTotal = async function () {
        //获取当前总投次数
        return new Promise((resolve, reject) => {
          var ret;
          db.collection(GuessLog).countDocuments({
              name: nameInfo.name
            },
            function (err, result) {
              //assert.equal(null, err);
              err ? resolve(0) : resolve(result);
            }
          );
        });
      };
      //获取有效投注数目
      var total = await getTotal();
      log.debug("total guess: ", total);
      var getHitTotal = async function () {
        //获取当前总投次数
        return new Promise((resolve, reject) => {
          var ret;
          db.collection(GuessLog).countDocuments({
              name: nameInfo.name,
              archive: 0
            },
            function (err, result) {
              //assert.equal(null, err);
              err ? resolve(0) : resolve(result);
            }
          );
        });
      };
      var hitTotal = await getHitTotal();
      // update all record in guesslog to bonuslog
      log.debug("Total hit guess is ", hitTotal);

      //计算所有数据的分析数据
      var num_up, num_down;
      var up_high, up_low, down_high, down_low;
      var sumpoint, avgpoint;
      num_up = num_down = 0;
      up_high = up_low = down_high = down_low = 0.0;
      sumpoint = 0;
      avgpoint = 0;
      var doCaculate = async function (page) {
        return new Promise(async (resolve, reject) => {
          var ret;
          var step;
          db.collection(GuessLog)
            .find({
              name: contractName,
              archive: 0
            })
            .sort({
              //'point': 1,
              timestamp: 1
            })
            .limit(BatchSize)
            .skip(page * BatchSize)
            .toArray(function (err, result) {
              assert.equal(null, err);
              //console.log(result);
              resolve(result);
            });
        });
      };
      var billboard = new Array(100);
      var insertBoard = function (node) {
        //log.debug(node);
        var qulified = 0;
        if (node.point - baseIndex >= 0 && Diff >= 0) {
          qulified = 1;
        }
        if (node.point - baseIndex < 0 && Diff < 0) {
          qulified = -1;
        }
        if (qulified == 0) {
          return; //不qulified 排除，无需排队
        }

        for (var i = 0; i < 100; i++) {
          var userdiff = Math.abs(node.point - baseIndex);
          var userdistance = Math.abs(Math.abs(Diff) - userdiff);
          log.debug("user distance", userdistance);

          if (billboard[i]) {
            var idiff = billboard[i].distance;
            log.debug("now the distance is", idiff);
            if (userdistance < idiff) {
              node.distance = userdistance;
              billboard.splice(i, 0, node);
              //log.debug(billboard);
              break;
            }
          } else {
            node.distance = userdistance;
            billboard[i] = node;
            break;
          }
        }
      };
      //批处理计算
      var batchProcess = async function () {
        return new Promise(async (resolve, reject) => {
          var totalpage = Math.floor(hitTotal / BatchSize);
          var yu = hitTotal / BatchSize - totalpage;
          if (yu > 0) {
            totalpage = totalpage + 1;
          }
          log.debug("Total page is ", totalpage);
          for (var page = 0; page < totalpage; page++) {
            result = await doCaculate(page);
            for (var idx = 0; idx < result.length; idx++) {
              //console.log(result[idx].addr);
              let userdiff = result[idx].point - baseIndex;
              sumpoint = sumpoint + result[idx].point;
              if (userdiff < 0) {
                num_down++;
                if (down_low == 0.0) {
                  down_low = result[idx].point;
                } else if (down_low > result[idx].point) {
                  down_low = result[idx].point;
                }
                if (down_high == 0.0) {
                  down_high = result[idx].point;
                } else if (down_high < result[idx].point) {
                  down_high = result[idx].point;
                }
              } else {
                num_up++;
                if (up_high == 0.0) {
                  up_high = result[idx].point;
                } else if (up_high < result[idx].point) {
                  up_high = result[idx].point;
                }
                if (up_low == 0.0) {
                  up_low = result[idx].point;
                } else if (up_low > result[idx].point) {
                  up_low = result[idx].point;
                }
              }
              insertBoard({
                addr: result[idx].addr,
                point: result[idx].point,
                name: result[idx].name,
                timestamp: result[idx].timestamp
              });
            }
            //console.log('3');
          }
          resolve(true);
        });
      };
      await batchProcess();

      log.debug("The billboard length is :", billboard.length);
      log.debug("==============================================");
      log.debug("content is :", billboard);
      log.debug("==============================================");

      //update to Users log;
      var updateOneUser = async function (node, otherbonus, id) {
        return new Promise(async (resolve, reject) => {
          var score = 0; // = BaseBonus;
          var ret;
          if (otherbonus > 0) {
            score = BaseBonus + otherbonus; //大于0就加   这里是前５０奖金
          } else {
            score = BaseBonus;
          }
          log.debug("add score :", node.addr, score, mydate.yyyymmdd());
          try {
            var cursor = db.collection(UserBonus).findOneAndUpdate({
                //一天一条获奖记录
                addr: node.addr, //地址
                name: contractName
              }, {
                $set: {
                  tranking: id + 1,
                  score: score,
                  bingo: node.distance == Diff ? true : false,
                  sent: false,
                  timestamp: node.timestamp,
                  shindex: targetIndex
                }
              }, {
                returnOriginal: false,
                upsert: false
              },
              function (err, data) {
                resolve(data);
              }
            );
          } catch (e) {
            console.log(e);
            log.error(e);
            reject(e);
          }
        });
      };
      var updateUserbatch = async function () {
        return new Promise(async (resolve, reject) => {
          try {
            log.debug("today's billboard has  :", billboard.length);
            //bulk = db.bulkTest.initializeUnorderedBulkOp();
            //var batch = db.collection(UserBonus).initializeUnorderedBulkOp();
            for (var uindex = 0; uindex < billboard.length; uindex++) {
              if (billboard[uindex]) {
                log.debug(
                  "update user ",
                  billboard[uindex].addr,
                  BaseBonus - uindex,
                  uindex
                );
                await updateOneUser(
                  billboard[uindex],
                  BaseBonus - uindex,
                  uindex
                );
                log.debug("update one :", uindex);
              }
            }
          } catch (e) {
            console.log(e);
            log.error(e);
          } finally {
            resolve(true);
          }
        });
      };
      var batchupdate = await updateUserbatch();

      log.debug(batchupdate);
      avgpoint = sumpoint / hitTotal;

      log.debug(
        num_up,
        num_down,
        up_high,
        up_low,
        down_high,
        down_low,
        sumpoint,
        avgpoint
      );
      log.debug("get main account balance");

      var balance = await guessit.chain3.toDecimal(
        guessit.chain3.toHex(
          await guessit.chain3.mc.getBalance(guessit.poolaccount)
        )
      );
      //var balance2 = await guessit.getBalance();
      log.info("主合约有", balance);

      log.debug("end caculation,Try to update record!");
      //更新分析数据库
      log.debug("the diff is ", (100 * (avgpoint - targetIndex)) / targetIndex);
      var updateResult = () => {
        return new Promise((resolve, reject) => {
          var updatefield = {
            $set: {
              //tradeday: mydate.yyyymmdd(),
              contract: contractAddr,
              total: total,
              up: num_up,
              down: num_down,
              up_low: up_low,
              up_high: up_high,
              down_low: down_low,
              down_high: down_high,
              caculated: true,
              totalhits: hitTotal,
              average: avgpoint,
              diff: (100 * (avgpoint - targetIndex)) / targetIndex,
              balance: balance / Math.pow(10, 18)
            }
          };
          db.collection(Records).findOneAndUpdate({
              tradeday: mydate.yyyymmdd()
            },
            updatefield, {
              upsert: false
            },
            function (err, result) {
              assert.equal(null, err);
              resolve(result);
            }
          );
        });
      };

      //Step 2: async promise handler
      var calltoUpdate = async () => {
        var result = await updateResult();
        return result;
      };
      //Step 3: make the call
      calltoUpdate().then(function (result) {
        log.debug("成功记录统计结果");
      });
    } catch (e) {
      log.error(e);
    } finally {
      if (client) {
        client.close();
      }
    }
  },

  //发完奖金，将数据库记录下已发奖金数
  updateUserbonus: function (addr, dateinfo, amount, balance) {
    return new Promise(async (resolve, reject) => {
      var ret;
      var client;
      try {
        // Use connect method to connect to the Server
        client = await MongoClient.connect(new Server("localhost", 27017));
        const db = client.db("guessit");
        //获取分析表数据判断是否可以执行分析，字段ready为ｔｒｕｅ
        var saveUserbonus = async function () {
          return new Promise((res, rej) => {
            log.debug("update bonuslog:", addr, dateinfo, amount, balance);
            try {
              db.collection(UserBonus).findOneAndUpdate({
                  addr: addr,
                  tradeday: dateinfo
                }, {
                  $set: {
                    bonus: amount, //将见
                    sent: true
                  }
                }, {
                  upsert: false
                },
                function (err, result) {
                  console.log("update bonuslog ", result);
                  if (result) {
                    res(result);
                  } else {
                    rej(err);
                  }
                }
              );
            } catch (e) {
              console.log(e);
              log.debug(e);
            }
          });
        };
        var ret = await saveUserbonus();
        log.debug(ret);
        var findname = async function (name) {
          return new Promise(async (ress, rejj) => {
            db.collection(UserProfile)
              .find({
                addr: name.toLowerCase()
              })
              .limit(1)
              .project({
                _id: 0,
                nickname: 1
              })
              .next(function (err, result) {
                if (result) {
                  ress(result);
                } else {
                  ress("");
                }
              });
          });
        };
        var nick = await findname(addr); //活动用户昵称
        //用来保存数据到ｒｅｃｏｒｄ数据中
        var saveToRecord = async function () {
          return new Promise((res, rej) => {
            try {
              db.collection(Records).findOneAndUpdate({
                  tradeday: dateinfo //根据日期更新
                }, {
                  $set: {
                    balance: balance, //更新发奖金时的真实金额　20181105
                    result: {
                      bonus: amount, //中奖人信息
                      nickname: nick.nickname,
                      addr: addr
                    }
                  }
                }, {
                  upsert: false //不可添加
                },
                function (err, result) {
                  //log.debug('update winner info into a record:',result);
                  if (result) {
                    res(result);
                  } else {
                    rej(err);
                  }
                }
              );
            } catch (e) {
              console.log(e);
            }
          });
        };
        var saveResult = await saveToRecord();

        log.debug(saveResult);
        /*var updateToBonuslog = async function () {
          return new Promise((res, rej) => {
            try {
              db.collection(UserBonus)
                .findOneAndUpdate({
                    addr: addr, //根据日期更新
                    archive: 0,
                    tradeday: dayinfo
                  }, {
                    $set: {
                      bonus: amount, //中奖人信息

                    }
                  }, {
                    upsert: false //不可添加
                  },
                  function (err, result) {
                    //log.debug('update winner info into a record:',result);
                    if (result) {
                      res(result);
                    } else {
                      rej(err);
                    }
                  }
                );
            } catch (e) {
              console.log(e);
            }
          });
        };*/
      } catch (e) {
        console.log(e);
        log.error(e);
      } finally {
        client.close;
        resolve(ret);
      }
    });
  },

  //保存用户的ｎｉｃｋname
  saveNickNameByAddr: async function (addr, nickname) {
    return new Promise(async (resolve, reject) => {
      var ret;
      var client;
      try {
        // Use connect method to connect to the Server
        client = await MongoClient.connect(new Server("localhost", 27017));
        const db = client.db("guessit");
        //获取分析表数据判断是否可以执行分析，字段ready为ｔｒｕｅ

        var updateNickname = async function () {
          return new Promise((resol, reje) => {
            db.collection(UserProfile).findOneAndUpdate({
                addr: addr.toLowerCase()
              }, {
                $set: {
                  nickname: nickname
                }
              }, {
                upsert: true
              },
              function (err, result) {
                console.log("save user profile", result);
                if (result) {
                  resol(result);
                } else {
                  reje(err);
                }
              }
            );
          });
        };
        var info = await updateNickname();
        log.debug(info);
        ret = true;
      } catch (e) {
        ret = false;
        log.error(e);
      } finally {
        client.close();
        return ret;
      }
    });
  },

  //基于地址生产ｍｅ　ｐｒｏｆｉｌｅ，并执行回调函数　被account 调用
  generateUserProfile: async function (addr, callback) {
    var client;
    var retvalue;
    try {
      var normoladdr = addr.toLowerCase();
      log.info(normoladdr);
      client = await MongoClient.connect(new Server("localhost", 27017));
      const db = client.db("guessit");
      //获取分析表数据判断是否可以执行分析，字段ready为ｔｒｕｅ
      var total, bingo, totalbonus, totalscroe;
      var getTotal = async function () {
        return new Promise((resol, reje) => {
          db.collection(GuessLog).countDocuments({
              addr: normoladdr
            },
            function (err, result) {
              //log.debug("found:", result);
              if (result) {
                resol(result);
              } else {
                log.error(err);
                resol(0);
              }
            }
          );
        });
      };
      total = await getTotal(); //总共的竞猜,注意错误就返回０

      log.debug("total :", total);
      if (total == 0) {
        log.debug("User no any activity");
        callback({
          total: 0, //total  为０就立刻返回
          bingo: 0,
          totalbonus: 0.0,
          score: 0,
          usage: {}
        });
        //return;
        throw "no data"; //调用回调函数后退出
      }
      var getWinCountByAddr = async function (addr) {
        return new Promise((resol, reje) => {
          db.collection(UserBonus).countDocuments({
              addr: normoladdr,
              tranking: 1
            },
            function (err, result) {
              if (result) {
                resol(result);
              } else {
                log.error(err);
                resol(0);
              }
            }
          );
        });
      };
      var totalwin = await getWinCountByAddr(normoladdr);
      log.debug("total win", totalwin);

      var getTotalscoreByAddr = async function () {
        return new Promise((resol, reje) => {
          try {
            db.collection(UserBonus)
              .aggregate([{
                  $match: {
                    addr: normoladdr
                  }
                },
                {
                  $group: {
                    _id: null,
                    totalbonus: {
                      $sum: "$bonus"
                    },
                    totalscore: {
                      $sum: "$score"
                    }
                  }
                }
              ])
              .next(function (err, result) {
                //log.debug('total score',result);
                if (result) {
                  resol(result);
                } else {
                  log.error(err);
                  resol(null);
                }
              });
          } catch (e) {
            console.log(e);
            log.error(e);
            resolve(null);
          }
        });
      };
      var result = await getTotalscoreByAddr();
      log.debug("total score", result);
      if (result) {
        totalbonus = result.totalbonus;
        totalscore = result.totalscore;
      } else {
        totalbonus = 0;
        totalscore = 0;
      }

      retvalue = {
        total: total,
        bingo: totalwin,
        totalbonus: totalbonus,
        score: totalscore
      };
      //从guesslog 和bonuslog中产生新文档
      /*date - string，竞猜日期：这是用户某一天的有效竞猜记录日期
                              shindex - string，上证指数：这是记录用户竞猜的时候，上证指数收盘点位
                              point - string，我猜的点位：这是用户有效竞猜的点位
                              position - string，排名：这是用户竞猜当日的接近猜中程度排名
                              bonus - string 奖励：这是用户竞猜当日获得的奖励，奖励可能是当日奖，也可能是双周
                              */

      var generateActivityList = async function () {
        log.debug("find user activity:", normoladdr);
        return new Promise((resol, reje) => {
          try {
            db.collection(UserBonus)
              .find({
                addr: normoladdr
              })
              .limit(250)
              .project({
                _id: 0,
                tradeday: 1,
                shindex: 1,
                point: 1,
                bonus: 1,
                score: 1
              })
              .sort({
                tradeday: 1
              })
              .toArray(function (err, result) {
                //log.debug(err);
                //log.debug(result);
                if (!err) {
                  resol(result);
                } else {
                  resol(null);
                }
              });
          } catch (e) {
            console.log(e);
            resol(null);
          } finally {
            console.log("done!");
          }
        });
      };

      retvalue.usage = await generateActivityList();

      callback(retvalue); //do the recall back
    } catch (e) {
      console.log("get profile error", e);
      log.error(e);
    } finally {
      client.close();
    }
  },

  //update 周期更新交易数据
  updateJob: async function (dayinfo) {
    var guessit = require("./guessit.js");
    var client;
    try {
      // var normoladd = add.toLowerCase();
      //log.debug("try to update the total number periodcally:", dayinfo);
      client = await MongoClient.connect(new Server("localhost", 27017));
      const db = client.db("guessit");
      var dt = new Date(parse(dayinfo));
      if (!isTradeDay(dt)) {
        dt = getNextTradeDay(dt); //如果今天不是交易日，获取下一个交易日的内容
      }
      var getContractByDate = async function () {
        return new Promise((resolve, reject) => {
          db.collection(MarketDays)
            .find({
              openday: dt.yyyymmdd() //获取今天的合约
            })
            .sort("openday", 1)
            .limit(1)
            .toArray(function (err, data) {
              err ? reject(null) : resolve(data[0]);
            });
        });
      };
      var content = await getContractByDate();
      if (content == null) {
        log.debug("The daily contract not found!", dayinfo);
        throw "Update job:contract not found";
        //return;
      }
      //获取分析表数据判断是否可以执行分析，字段ready为ｔｒｕｅ
      var total, bingo, totalbonus, scroe;
      log.debug("found contrat with name:", content.name);
      //log.debug("get totalhits ....");
      var getTotalhits = async function () {
        return new Promise((resol, reje) => {
          db.collection(GuessLog).countDocuments({
              name: content.name,
              archive: 0
            },
            function (err, result) {
              //log.debug("total hit:", result);
              if (result) {
                resol(result);
              } else {
                reje(err);
              }
            }
          );
        });
      };
      var totalhits = await getTotalhits();
      //log.debug("get total ....");
      var getTotal = async function () {
        return new Promise((resol, reje) => {
          db.collection(GuessLog).countDocuments({
              name: content.name
            },
            function (err, result) {
              //log.debug("total:", result);
              if (result) {
                resol(result);
              } else {
                reje(err);
              }
            }
          );
        });
      };
      var total = await getTotal();
      //log.debug("get tool moac pool...");
      var balance = await guessit.chain3.toDecimal(
        guessit.chain3.toHex(
          await guessit.chain3.mc.getBalance(guessit.poolaccount)
        )
      );
      log.debug("total bonus is ", balance / Math.pow(10, 18));
      var update = async function () {
        return new Promise((res, rej) => {
          db.collection(Records).updateOne({
              tradeday: dayinfo
            }, {
              $set: {
                total: total,
                totalhit: totalhits,
                balance: balance / Math.pow(10, 18)
              }
            },
            function (err, dddd) {
              //log.debug(dddd);
              res(dddd);
            }
          );
        });
      };
      await update();
      log.debug("Update job:", dayinfo, total, totalhits);
      client.close();
    } catch (e) {
      console.log(e);
      log.error(e);
    }
  },

  //生成用户总体排行榜
  generateUserBillBorad: async function (callback) {
    return new Promise(async (resolve, reject) => {
      var client;
      try {
        client = await MongoClient.connect(new Server("localhost", 27017));
        const db = client.db("guessit");

        var getTotalscoreByAddr = async function () {
          return new Promise((resol, reje) => {
            try {
              db.collection(UserBonus)
                .aggregate([{
                  $group: {
                    _id: "$addr",
                    // totalbonus:{$sum:'$bonus'},
                    totalscore: {
                      $sum: "$score"
                    }
                  }
                }])
                .sort({
                  //totalbonus:-1,
                  totalscore: -1
                })
                .limit(50) //最多５０位
                .toArray(function (err, result) {
                  log.debug(result);
                  if (result) {
                    resol(result);
                  } else {
                    resol(null);
                  }
                });
            } catch (e) {
              console.log(e);
              log.error(e);
            }
          });
        };
        var bill = await getTotalscoreByAddr();

        var findname = async function (name) {
          return new Promise(async (ress, rejj) => {
            db.collection(UserProfile)
              .find({
                addr: name.toLowerCase()
              })
              .limit(1)
              .project({
                _id: 0,
                nickname: 1
              })
              .next(function (err, result) {
                if (result) {
                  ress(result);
                } else {
                  ress("");
                }
              });
          });
        };
        // var nick = await findname(normoladdr);
        //log.debug(bill);
        for (var i = 0; i < bill.length; i++) {
          var nick;
          if (bill[i]._id) {
            nick = await findname(bill[i]._id);
          } else {
            nick = "";
          }
          if (nick) {
            bill[i].nickname = encodeURI(nick.nickname);
          } else {
            bill[i].nickname = "";
          }
        }
        log.debug(bill);
        callback(bill);
        log.info("finished get system board");
      } catch (e) {
        console.log(e);
        log.debug(e);
      } finally {
        client.close();
        resolve(true);
      }
    });
  },
  //获取用户历史数据
  /*
              date - string， YY-MM-DD。竞猜日期。 例子：2018-10-12
              total - string，整数位。竞猜日参与竞猜的人数
              shindex - string 小数点后面2位，竞猜日上证收盘指数
              average - string, 小数点后面2位，竞猜日竞猜指数均值
              diff - string, 小数点后面2位，竞猜均值和上证收盘之间的误差
              bonus - string， 只取整数位，竞猜日中奖的奖金数目
              nickname - string， 竞猜日中奖地址的别名
              addr - string， 竞猜日中奖钱包地址，
          */
  getHistory: async function (callback) {
    return new Promise(async (resol, reje) => {
      var client;
      try {
        client = await MongoClient.connect(new Server("localhost", 27017));
        const db = client.db("guessit");
        var generateList = async function () {
          return new Promise((res, rej) => {
            try {
              db.collection(Records)
                .aggregate([{
                    $match: {
                      caculated: true
                    }
                  },
                  {
                    $sort: {
                      tradeday: 1
                    }
                  },
                  {
                    $limit: 250
                  },
                  {
                    $project: {
                      _id: 0,
                      date: "$tradeday",
                      diff: 1,
                      shindex: "$toidxsh",
                      totalhits: 1,
                      average: 1,
                      bonus: "$result.bonus",
                      nickname: "$result.nickname",
                      addr: "$result.addr"
                    }
                  }
                ])
                .toArray(function (err, result) {
                  log.debug("user history:", result);
                  if (result) {
                    res(result);
                  } else {
                    res(null);
                  }
                });
            } catch (e) {
              console.log(e);
              res(null);
            }
          });
        };
        var history = await generateList();
        callback(history);
      } catch (e) {
        console.log(e);
        log.debug(e);
      } finally {
        client.close();
        resol(true);
      }
    });
  },
  //检查用户在某日是否获奖
  isBingo: async function (addr, dayinfo, callback) {
    var dateInput;
    try {
      dateInput = parse(dayinfo);
      if (!isTradeDay(dateInput)) {
        dateInput = getPreTradeDay(dateInput); //若本日不是交易日，区最近的
      }
    } catch (e) {
      log.debug("输入日期错误", e);
      return;
    }

    var client;
    try {
      client = await MongoClient.connect(new Server("localhost", 27017));
      const db = client.db("guessit");
      var findout = async function () {
        return new Promise((res, rej) => {
          try {
            db.collection(UserBonus).findOne({
                addr: addr.toLowerCase(),
                tradeday: dateInput.yyyymmdd() // note: the day format
              },
              function (err, result) {
                //log.debug(result);
                if (result) {
                  res(result);
                } else {
                  rej(null);
                }
              }
            );
          } catch (e) {
            console.log(e);
          }
        });
      };
      var re = await findout();
      callback(re);
    } catch (e) {
      console.log(e);
      log.debug(e);
    } finally {
      client.close();
    }
  },

  //获取前一个交易日的前５０名交易信息，
  /*包括，提交ｔｉｍｅｓｔａｍ，ｐｏｉｎｔ，ｎｉｃｋｎａｍｅ，ａｄｄｒ */
  //dayinfo 格式是date object
  getDailyTop50: async function (dayinfo, callback) {
    var guessit = require("./guessit.js");

    var client;
    try {
      // var normoladd = add.toLowerCase();
      //log.debug("try to update the total number periodcally:", dayinfo);
      client = await MongoClient.connect(new Server("localhost", 27017));
      const db = client.db("guessit");
      /*var dt = new Date(dayinfo);
      dt = dt.addDays(-1); //前一天
      if (!isTradeDay(dt)) {
        dt = getPreTradeDay(dt); //如果今天不是交易日，获取下一个交易日的内容
      }
      var getContractByDate = async function () {
        return new Promise((resolve, reject) => {
          db.collection(MarketDays)
            .find({
              openday: dt.yyyymmdd() //获取今天的合约
            })
            .sort("openday", 1)
            .limit(1)
            .toArray(function (err, data) {
              err ? reject(null) : resolve(data[0]);
            });
        });
      };
      var content = await getContractByDate();
      if (content == null) {
        log.debug("The daily contract not found!", dayinfo);
        throw "dailly 50 search error";
        //return;
      }*/
      //获取分析表数据判断是否可以执行分析，字段ready为ｔｒｕｅ
      var total, bingo, totalbonus, scroe;

      var getLastBonusEntry = async function () {
        return new Promise((resol, reje) => {
          try {
            db.collection(UserBonus)
              .find({
                // tranking: 1
              })
              .sort({
                tradeday: -1
              })
              //.limit(1000)
              .next(function (err, data) {
                console.log("the last record is ", data);
                resol(data);
              });
          } catch (e) {
            console.log(e);
            log.error(e);
            reje(null);
          }
        });
      };
      var lastentry = await getLastBonusEntry();

      log.debug("try to find latest bonus contract name ", lastentry.name);

      log.debug("get 50 user account information ....");
      var getUsers = async function () {
        return new Promise((resol, reje) => {
          try {
            db.collection(UserBonus)
              .find({
                name: lastentry.name,
                tranking: {
                  $gt: 0
                }
              })
              .sort({
                tranking: 1
              })
              .limit(50)
              .project({
                _id: 0,
                timestamp: 1,
                addr: 1,
                point: 1
              })
              .toArray(function (err, result) {
                log.debug("total hit:", result);
                if (result) {
                  resol(result);
                } else {
                  reje(err);
                }
              });
          } catch (e) {
            console.log(e);
            log.debug(e);
          }
        });
      };
      var top50 = await getUsers();
      callback(top50);
      //log.debug("top50 result :", top50);
      client.close();
    } catch (e) {
      console.log(e);
      log.error(e);
    } finally {}
  }
}; //end of exports