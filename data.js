var Server = require('mongodb').Server,
    Db = require('mongodb').Db,
    mongo = require('mongodb'),
    MongoClient = require('mongodb').MongoClient,
    ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Grid = require('mongodb').Grid,
    Code = require('mongodb').Code
var async = require('async');


const urlNew = new Server("localhost", 27017, {
    native_parser: true
});

const {
    MongoPool,
    clientConnect,
    clientClose
} = require('./dbMongo');

var assert = require('assert');

var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var months = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
var holidays = new Array("2018-9-24", "2018-9-22", "2018-9-23", '2018-10-1', '2018-10-2', '2018-10-3', '2018-10-4', '2018-10-5', '2018-10-6');

var DBName = "guessit";
var MarketDays = "marketdays";
var GuessLog = "guesslog";
var url = 'mongodb://localhost:27017/';

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
}

Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();
  
    return [this.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('');
  };
  
/*
module.exports = {
    getOpenDay: getOpenDay,
    createMarketDay: createMarketDay,
    getNextAvaiableOpenDay: getNextAvaiableOpenDay,
    setContract: setContract,
    keepData: keepData,

};*/


var isHolidy= function (one) {
    var target = one;
    for (var j = 0; j < holidays.length; j++) {
        var item = new Date(holidays[j]);
        if (target == item) {
            console.log("is holidy:" + one.toDateString());
            return true;
        }
        //console.log("remove holiday:" + item.toDateString);
    }
    return false;
}
// 格式化日期时间，从九点开始算，
//下一天的时间上海本地时间，当前所有大于九点是获得的竞猜日算作下一天
var formatTime= function (t) {
    var ret = t;
    ret.setHours(9);
    ret.setMinutes(0);
    ret.setSeconds(0);
    ret.setMilliseconds(0);
    return ret;
}

function parse(str) {
    var y = str.substr(0,4),
        m = str.substr(4,2) - 1,
        d = str.substr(6,2);
    var D = new Date(y,m,d);
    return (D.getFullYear() == y && D.getMonth() == m && D.getDate() == d) ? D : 'invalid date';
}

module.exports = {


    getOpenDay: (async function (ti, cbb) {
        var dt = new Date(ti);
        let client;
        try {
            // Use connect method to connect to the Server
            client = await MongoClient.connect(new Server("localhost", 27017));

            const db = client.db("guessit");
            var myPromise = () => {
                console.log("query today  ")
                return new Promise((resolve, reject) => {
                    db.collection(MarketDays).find({
                            'openday': {"$gte":dt.yyyymmdd()}
                        }).sort("openday", 1)
                        .limit(2)
                        .toArray(function (err, data) {
                            //console.log(data);
                            err ? reject(err) : resolve(data);
                        });
                });
            };

            //Step 2: async promise handler
            var callMyPromise = async () => {
                var result = await (myPromise());
                return result;
            };

            //Step 3: make the call
            callMyPromise().then(function (result) {
                // client.close();
                cbb(result);
            });

        } catch (e) {
            console.log(e);
        }
        if (client) {
            client.close();
        }

    }),
    //根据ｂｉｄ名称获取ｃｏｎｔｒａｃｔ
    getContractByName: (async function (name, cbb) {
        
        let client;

        try {
            // Use connect method to connect to the Server
            client = await MongoClient.connect(new Server("localhost", 27017));

            const db = client.db("guessit");
            var myPromise = () => {
                return new Promise((resolve, reject) => {
                    db.collection(MarketDays).find({
                            'name': name
                        }).limit(1).toArray(function (err, data) {
                            //console.log(data);
                            err ? reject(err) : resolve(data);
                        });
                });
            };

            //Step 2: async promise handler
            var callMyPromise = async () => {
                var result = await (myPromise());
                return result;
            };

            //Step 3: make the call
            callMyPromise().then(function (result) {
                cbb(result);
            });

        } catch (e) {
            console.log(e);
        }
        if (client) {
            client.close();
        }
    }),
    //根据ａｄｄｒ获取用户提交内容
    getSubmit: (async function (addr, cbb) {
        var dt = new Date(ti);
        let client;

        try {
            // Use connect method to connect to the Server
            client = await MongoClient.connect(new Server("localhost", 27017));

            const db = client.db("guessit");
            var myPromise = () => {
                return new Promise((resolve, reject) => {
                    db.collection(GuessLog).find({
                            'openday': dt.yyyymmdd()
                        }).sort("openday", 1)
                        .limit(1)
                        .toArray(function (err, data) {
                            console.log(data);
                            err ? reject(err) : resolve(data);
                        });
                });
            };

            //Step 2: async promise handler
            var callMyPromise = async () => {
                var result = await (myPromise());
                return result;
            };

            //Step 3: make the call
            callMyPromise().then(function (result) {
                // client.close();
                cbb(result);
            });

        } catch (e) {
            console.log(e);
        }
        if (client) {
            client.close();
        }

    }),
    //从ｓｄ开始创建开始记录，长度为duration days,
    //所有标记时间均为9:00开始，
    createMarketDay: async function (sd, duration) {
            var mydate = new Date(sd);
            MongoClient.connect(urlNew, async function (err, dbc) {
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
                        if(holidays.indexOf(me.toLocaleDateString())>=0) {
                            continue;
                        }
                        var marketDay = {
                            openday: me.yyyymmdd(),
                            name: "",
                            created: false,
                            contract: "",
                            result: {},
                            total: 0
                        }
                        console.log(me);
                        db.collection(MarketDays).insertOne(marketDay, function (err, result) {
                            assert.equal(null, err);
                            //console.log("insert One record:");
                        })
                        // console.log("插入一条开市记录:" + mydate.toDateString());
                    }
                    resolve(db);
                });
                console.log("Finished Create data record");
                dbc.close();
            });
        },

        //获得下一个交易日, t is milionsecond
    getNextAvaiableOpenDay: (async function (t,next, callback) {
            var dd = new Date(t);
            if(next){
                dd = dd.addDays(1);
            }
            var range = 2; //返回今天和下一个交易日的内容
            //dd = formatTime(dd);
            var client;
            try{
                client = await MongoClient.connect(new Server("localhost", 27017));

                const db = client.db(DBName);
                var query = {
                    'openday': {
                        "$gte": dd.yyyymmdd()
                    }
                }
                console.log(query);
                var myPromise = () => {
                    return new Promise((resolve, reject) => {
                        console.log("do query next :"+query.toString());
                        db.collection(MarketDays).find(query).limit(2).sort("openday", 1).toArray(function (err, result) {
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
                    var result = await (myPromise());
                    return result;
                };

                //Step 3: make the call
                callMyPromise().then(function (result) {
                    // client.close();
                    callback(result);
                });

            }catch(e){
                console.log(e);

            }finally{
                client.close();
            }
           
        }),
// TODO , need to update the database base on address , name 
//记录不存在，就插入，存在就更新
    keepData: async function (blocknunber, tx, addr, name, point) {
            var ti = new Date();
            try{
                client = await MongoClient.connect(new Server("localhost", 27017));

                const db = client.db("guessit");
                var query = {
                    bidtime : ti.yyyymmdd(),
                    addr:addr,
                    name:name
                }
                var guesslog = {
                 
                    bidtime: ti.yyyymmdd(),
                    ctime:Date.now(),
                    name: name,
                    tx: tx,
                    block: blocknunber,
                    point: point,
                    addr: addr
                }
                var myPromise = () => {
                    return new Promise((resolve, reject) => {
                        db.collection("guesslog").replaceOne(query,guesslog,{upsert:true}, function (err, result) {
                            assert.equal(null, err);
                            console.log("insert or update guess record:");
                            resolve(result);
                        })
                    });
                };
                  //Step 2: async promise handler
                var callMyPromise = async () => {
                    var result = await (myPromise());
                    return result;
                };

                //Step 3: make the call
                callMyPromise().then(function (result) {
                    // client.close();
                  // console.log(result);
                });

            }catch(e){

            }finally{
                client.close();
            }

        },
    
    getUserStat:async function(addr,callback){
        var ti = new Date();
        try{
            client = await MongoClient.connect(new Server("localhost", 27017));

            const db = client.db("guessit");
            var query = {
                addr:addr
            }
            var myPromise = () => {
                return new Promise((resolve, reject) => {
                    db.collection("guesslog").find(query).sort("bidtime",-1).limit(8).toArray(function (err, result) {
                        assert.equal(null, err);
                        //console.log("found user guess record!");
                        //console.log(result);
                        resolve(result);
                    })
                });
            };
              //Step 2: async promise handler
            var callMyPromise = async () => {
                var result = await (myPromise());
                return result;
            };

            //Step 3: make the call
            callMyPromise().then(function (result) {
                //console.log(result);
               callback(result);
            });

        }catch(e){
            console.log(e);
        }finally{
            client.close();
        }

    },
    // 根据openday, name,和target 保存合约地址
    setContract: function (dat, name, target, addr) {
            var dd ;
            dd = parse(dat);
            console.log(typeof(dd).toString());
            if (typeof(dd)=='string'){
                dd = new Date(dat);
            }
            console.log(dd);
            MongoClient.connect(urlNew, function (err, dbc) {
                assert.equal(null, err);
                var db = dbc.db(DBName);
                var updateQuey = {
                    openday: dd.yyyymmdd()
                }
                console.log("update contract:" + dd.yyyymmdd());
                db.collection("marketdays").findOneAndUpdate(
                    updateQuey, {
                        "$set": {
                            'contract': addr,
                            'created': true,
                            'name': name,
                            'target': target
                        }
                    },
                    function (err, result) {
                        assert.equal(null, err);
                        //console.log(result);
                        dbc.close();
                    });
                // console.log("插入一条开市记录:" + mydate.toDateString());

            });
        },

}; //end of exports