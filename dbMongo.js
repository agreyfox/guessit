const assert = require('assert');
const MongoClient = require('mongodb').MongoClient;
const Server = require('mongodb').Server;
const DBurl = new Server("localhost", 27017, {
    native_parser: true
});
const Option = {
    db:{
        nunberOfRetries:5
    },
    server:{
        auto_reconnect:true,
        poolSize:40,
        socketOptions:{
            connectTimeoutMS:500
        }
    },
    replSet:{},
    mongos:{}
}

function MongoPool(){}

var p_db;
function initPool(cb){
    MongoClient.connect(DBurl,function(err,db){
        assert.equal(null,err);
        p_db=db;
        if(cb && typeof(cb)=='function') cb(p_db);
    });
    return MongoPool;
}
MongoPool.initPool=initPool;
function getInstance(cb){
    if(!p_db){
        initPool(cb);
    }else{
        if (cb && typeof(cb)=='function') cb(p_db);
    }
}
MongoPool.getInstance = getInstance;

module.exports = {
    MongoPool : MongoPool,
    /* 
     * Mongo Utility: Connect to client
     *
     */

    clientConnect: async () => (

            client = await (() => (new Promise((resolve, reject) => (

                MongoClient.connect(urlNew,
                    function (err, client) {
                        assert.equal(null, err);
                        resolve(client);
                    })
            ))))()),


        /* 
         * Mongo Utility: Close client
         *
         */

        clientClose: async (client) => {
            console.log("close");
            client.close();
            return true;
        }
};