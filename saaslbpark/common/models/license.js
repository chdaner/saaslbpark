'use strict';
var app = require('../../server/server');
//var app = require('../../common/models/license');
var MongoClient = require('mongodb').MongoClient;
var vac = require("../../server/business/vaccess.js");
var businessVaccess = new vac(app);

module.exports = function (License) {
  License.observe('before save', function (ctx, next) {
    var instance = ctx.instance || ctx.data;
    if (instance.vno) {
      console.log(instance.vno);
    }
    if (instance.vnobj) {
      console.log(instance.vnobj.vnoex);
    }
    instance.vno = "kkk";
    next();
  });

  License.status = function (cb) {
    var currentDate = new Date();
    var currentHour = currentDate.getHours();
    var OPEN_HOUR = 6;
    var CLOSE_HOUR = 20;
    console.log('Current hour is ' + currentHour);
    var response;
    if (currentHour > OPEN_HOUR && currentHour < CLOSE_HOUR) {
      response = 'We are open for business.';
    } else {
      response = 'Sorry, we are closed. Open daily from 6am to 8pm.';
    }
    cb(null, response);
  };
  License.remoteMethod(
    'status',
    {
      http: { path: '/status', verb: 'get' },
      returns: { arg: 'status', type: 'string' }
    }
  );
  /*
  License.plicense = function (dataobj,cb) {
    console.log('dataobj ' + dataobj.AlarmInfoPlate + 'serialno ' + dataobj.serialno);
    var url = 'mongodb://127.0.0.1:27017/lebo';
    var response;
    
    var License = app.module.License;
    License.create({
      vno: dataobj.AlarmInfoPlate,

    })
      .then(function (obj){
        if (obj) {
          response = 'dataobj ' + dataobj.AlarmInfoPlate + 'serialno ' + dataobj.serialno;
          cb(null, response);
        }
    })
    /*
    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log(err+'连接数据库失败');
        return;
      }
      db.collection('license').insertOne({ "vno": dataobj.AlarmInfoPlate}, function (error, result) {
        if (error) {
          console.log(error + '增加数据失败');
        }
      })
    })
    response = 'dataobj ' + dataobj.AlarmInfoPlate + 'serialno ' + dataobj.serialno;
    cb(null, response);
  };*/

  License.remoteMethod(
    'plicense',
    {
      "accepts": [
        {
          "arg": "dataObj",
          "type": "object",
          "required": false,
          "description": "State of the license",
          "http": {
            "source": "body"
          }
        }
      ],
      http: { path: '/plicense', verb: 'post' },
      returns: { arg: 'status', type: 'string' }
    }
  );
  License.plicense = businessVaccess.plicense;
};
