var app = require('../../server/server');
var vac = require("../../server/business/vaccess.js");
var businessVaccess = new vac(app);

module.exports = function(lbcarrest) {
  lbcarrest.remoteMethod(
    'addVaccess',
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
      http: { path: '/addVaccess', verb: 'post' },
      returns: { arg: 'ret', type: 'object' }
    }
  );
  lbcarrest.addVaccess = businessVaccess.addVaccess;

  lbcarrest.remoteMethod(
    'getParkFee',
    {
      "accepts": [
        {
          "arg": "jsondata",
          "type": "dataObj",
          "required": false,
          "description": "Calculate park fee",
          "http": {
            "source": "body"
          }
        }      
      ],
      http: { path: '/getParkFee', verb: 'post' },
      returns: { arg: 'result', type: 'object' }
    }
  );
  lbcarrest.getParkFee = businessVaccess.getParkFee;

  lbcarrest.remoteMethod(
    'getCardInfo',
    {
      "accepts": [
        {
          "arg": "jsondata",
          "type": "dataObj",
          "required": false,
          "description": "Get Card Infomation"
        }      
      ],
      http: { path: '/getCardInfo', verb: 'post' },
      returns: { arg: 'result', type: 'object' }
    }
  );
  lbcarrest.getCardInfo = businessVaccess.getCardInfo;

  lbcarrest.remoteMethod(
    'getVaccessInPark',
    {
      "accepts": [
        {
          "arg": "jsondata",
          "type": "dataObj",
          "required": false,
          "description": "Get ParkedRecord In Park",
          "http": {
            "source": "body"
          }
        }      
      ],
      http: { path: '/getVaccessInPark', verb: 'post' },
      returns: { arg: 'result', type: 'object' }
    }
  );
  lbcarrest.getVaccessInPark = businessVaccess.getVaccessInPark;

  lbcarrest.remoteMethod(
    'getInRecordByPark',
    {
      "accepts": [
        {
          "arg": "jsondata",
          "type": "dataObj",
          "required": false,
          "description": "Get In record by this park",
          "http": {
            "source": "body"
          }
        }      
      ],
      http: { path: '/getInRecordByPark', verb: 'post' },
      returns: { arg: 'result', type: 'object' }
    }
  );
  lbcarrest.getInRecordByPark = businessVaccess.getInRecordByPark;

  lbcarrest.remoteMethod(
    'getInRecordByAid',
    {
      "accepts": [
        {
          "arg": "jsondata",
          "type": "dataObj",
          "required": false,
          "description": "Get In record by this parkedrecord aid",
          "http": {
            "source": "body"
          }
        }      
      ],
      http: { path: '/getInRecordByAid', verb: 'post' },
      returns: { arg: 'result', type: 'object' }
    }
  );
  lbcarrest.getInRecordByAid = businessVaccess.getInRecordByAid;

  lbcarrest.remoteMethod(
    'getPassStatus',
    {
      "accepts": [
        {
          "arg": "jsondata",
          "type": "dataObj",
          "required": false,
          "description": "Get Passing Control Status"
        }      
      ],
      http: { path: '/getPassStatus', verb: 'post' },
      returns: { arg: 'result', type: 'object' }
    }
  );
  lbcarrest.getPassStatus = businessVaccess.getPassStatus;

  lbcarrest.remoteMethod(
    'getMemberPayMess',
    {
      "accepts": [
        {
          "arg": "jsondata",
          "type": "dataObj",
          "required": false,
          "description": "Get Member pay message"
        }      
      ],
      http: { path: '/getMemberPayMess', verb: 'post' },
      returns: { arg: 'result', type: 'object' }
    }
  );
  lbcarrest.getMemberPayMess = businessVaccess.getMemberPayMess;

  lbcarrest.remoteMethod(
    'getRuntimeOLPayMess',
    {
      "accepts": [
        {
          "arg": "jsondata",
          "type": "dataObj",
          "required": false,
          "description": "Get runtime online pay message"
        }      
      ],
      http: { path: '/getRuntimeOLPayMess', verb: 'post' },
      returns: { arg: 'result', type: 'object' }
    }
  );
  lbcarrest.getRuntimeOLPayMess = businessVaccess.getRuntimeOLPayMess;

  lbcarrest.remoteMethod(
    'getParkingConfigure',
    {
      "accepts": [
        {
          "arg": "jsondata",
          "type": "dataObj",
          "required": false,
          "description": "Get runtime online pay message"
        }      
      ],
      http: { path: '/getParkingConfigure', verb: 'post' },
      returns: { arg: 'result', type: 'object' }
    }
  );
  lbcarrest.getParkingConfigure = businessVaccess.getParkingConfigure;
  
  lbcarrest.remoteMethod(
    'userlogin',
    {
      "accepts":[
        {
          "arg":'jsondata',
          "type":'dataobj',  
          "required": false,
          "description": "State of the userlogin",  
          "http": {
            "source": "body"
          }     
        }
      ],
      http:{path:'/userlogin',verb:'post'},
      returns:{
        arg:'result',
        type:'object'
      }
    }
  );
  lbcarrest.userlogin = businessVaccess.userlogin;
  
};
