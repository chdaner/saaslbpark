var poolModule = require('generic-pool');
var settingf = require("../setting/setting.js");
var setting = settingf.setting;
var Redis = require('ioredis');
var Promise = require('bluebird');

function createClient() {
    var redis = new Redis({ "port": setting.redis_port, "host": setting.redis_host, "password": setting.redis_pwd });
    return redis;
};

const factory = {
    create: function() {
        createClient();
    },
    destroy: function(client) {
      client.disconnect();
    }
  };
   
  const opts = {
    max: 10, // maximum size of the pool
    min: 2 // minimum size of the pool
  };

  const myPool = poolModule.createPool(factory, opts);

exports.myPool = myPool;
exports.createClient = createClient;


