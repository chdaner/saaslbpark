// JavaScript source code
module.exports = function vaccess(app) {
  //var edge = require("edge");
  var sd = require('silly-datetime');
  var iconv = require('iconv-lite');
  var Common = require("../public/Common.js");
  var Promisify = require('../public/promisify.js');
  var sockreq = require('../server.js');
  var socksend = require('../business/socket.js');

  var memberpayurl = "http://188.128.0.135:3000/api/lbcarrest/ThirdMemberExit";
  var parkfeeurl = "http://188.128.0.135:3000/api/lbcarrest/getParkFee";
  var cardinfourl = "http://188.128.0.135:3000/api/lbcarrest/getCardInfo";
  var parkedinparkurl = "http://188.128.0.135:3000/api/lbcarrest/getVaccessInPark";
  var passStatusurl = "http://188.128.0.135:3000/api/lbcarrest/getPassStatus";
  var parkingconfigureurl = "http://188.128.0.135:3000/api/lbcarrest/getParkingConfigure";
  var lxmemberpayurl = "http://188.128.0.135:3000/api/lbcarrest/getMemberPayMess";
  var lxruntimeolpayurl = "http://188.128.0.135:3000/api/lbcarrest/getRuntimeOLPayMess";

  var redisHelper = require('../../server/public/redis');
  var restler = require('restler');
  var Promise = require('bluebird');
  var ArrayUtil = require('../tools/ArrayUtils');
  var pid = '59df360c5001d02c56e2bc53';
  var matchlibarray = ["8B","2Z","7Z"];
  var platelen = 7;

  Promise.promisifyAll(restler, {
    filter: function (name) {
        return Promisify.methodNamesToPromisify.indexOf(name) > -1;
    },
    promisifier: Promisify.EventEmitterPromisifier
  });

  this.plicense = function (dataobj, cb) {
    var result = {};
    console.log('dataobj ' + dataobj.AlarmInfoPlate + 'serialno111 ');
    var Vaccess = app.modules.Vaccess;
    console.log('dataobj123 ');
    Vaccess.create(
      {
        vno: "444"
      }
    )
      .then(function (obj) {
        if (obj) {
          response = 'dataobj ' + dataobj.AlarmInfoPlate + 'serialno ' + dataobj.serialno;
          cb(null, response);
        }
      })
  }

  this.addVaccess = function (dataobj, cb) {
    var result = {};
    var response = {};
    var outresult = {};
    var filelist = [];
    var serialdata = [];
    var time = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
    var aid = sd.format(new Date(), 'YYMMDDHHmmss' + '00000');
    var vno = dataobj.AlarmInfoPlate.result.PlateResult.license;
    var parkid = 1;
    var roadtype = 0;
    var Vaccess = app.models.Vaccess;
    var Cardinfo = app.models.cardinfo;
    var Deviceinfo = app.models.deviceinfo
    var DeviceInfo = app.models.Deviceinfo;
    var devicename = dataobj.AlarmInfoPlate.serialno;

    response.info = 'no';
    response.content = 'test';
    response.is_pay = 'false';
    response.serialData = serialdata;
    result.Response_AlarmInfoPlate = response;

    outresult.vno = vno;
    outresult.pid = pid;
    outresult.time = time;
    outresult.parkid = parkid;
    outresult.roadtype = roadtype;
    outresult.aid = aid;
    outresult.matchcardlist = true;
    outresult.matchinparklist = false;
    outresult.inparkmatchtrige = false;
    outresult.parkfee = 0;
    outresult.olpayfee = 0;
    outresult.actpayfee = 0;
    outresult.paytype = 1;
    outresult.cardstatus = 0;
    outresult.parkedstatus = 0;
    outresult.passStatus = 0;
    outresult.inremark = "";
    outresult.outremark = "";
    outresult.waitforpayfee = 0;
    
    Deviceinfo.findOne({ where: { "devicename": devicename } })
      .then(function(devicedata){
        if(devicedata){
          outresult.roadtype = devicedata.roadtype;
          return restler.postAsync(parkedinparkurl,{data:{jsondata:outresult}});
        }
        else{
          //设备信息不存在，返回
          return Promise.reject("breaksignal");
        }
      })
      .then(function(parkedobj){
        if(outresult.roadtype == 0){
          outresult.entr = devicename;
          outresult.entertime = time;
          if(parkedobj&&(parkedobj[1].statusCode == 200)){
            //入场，将已存在的入场记录虚拟出场（此操作可以异步处理）
            Vaccess.updateAll({"aid":parkedobj[0].result.aid},{"exit":devicename,"exittime":time,"parkfee":0,"actpayfee":0},function(err,info){
              if(err)
              {
                console.log('data 更新出场记录失败 ' + vno + err);
              }               
            })
          }       
        }
        else{
          outresult.exit = devicename;
          outresult.exittime = time;
          if(parkedobj&&(parkedobj[1].statusCode == 200)){
            if(parkedobj[0].result.parkedstatus == 2){
              //出场未找到入场记录，设置比对入场记录
              outresult.matchinparklist = true;
              outresult.inparkmatchtrige = true;
            }
            else{
              //存在入场记录，远程获取卡信息，不进行卡车牌比对
              outresult.matchcardlist = false;
              outresult.aid = parkedobj[0].result.aid;
              outresult.entertime = parkedobj[0].result.entertime;
              outresult.parkedstatus = parkedobj[0].result.parkedstatus;
              outresult.olpayfee = parkedobj[0].result.olpayfee;
            }
          }
          else{
            //出场未找到入场记录，设置比对入场记录
            outresult.matchinparklist = true;
            outresult.inparkmatchtrige = true;
          }
        }
        return restler.postAsync(cardinfourl,{data:{jsondata:outresult}});   
      })
      .then(function(cardobj){
        if(cardobj&&(cardobj[1].statusCode == 200)){
          outresult.vno = cardobj[0].result.vno;
          outresult.cardtypeid = cardobj[0].result.cardtypeid;
          outresult.cardtype = cardobj[0].result.cardtype;
          outresult.cardid = cardobj[0].result.cardid;
          outresult.feetype = cardobj[0].result.feetype;
          outresult.feetypeid = cardobj[0].result.feetypeid;
          outresult.cardstatus = cardobj[0].result.cardstatus;
          if(cardobj[0].result.hasmatchcard == true){
            //入场时成功进行了卡信息比对并获取到了新车牌，更新可能存在的入场记录
            Vaccess.updateAll({"pid":outresult.pid,"parkid":outresult.parkid,"vno":outresult.vno,"exit":""},
              {"exit":devicename,"exittime":time,"parkfee":0,"actpayfee":0},function(err,info){
              if(err)
              {
                console.log('data 更新出场记录失败 ' + vno + err);
              }               
            })
          }
        }
        if(outresult.roadtype == 1){
          if(outresult.inparkmatchtrige){
            //如果出场需要比对入场记录
            return restler.postAsync(parkedinparkurl,{data:{jsondata:outresult}});            
          }
        }
      })
      .then(function(inparkedobj){
        if(outresult.roadtype == 1){
          if(inparkedobj&&(inparkedobj[1].statusCode == 200)){
            //匹配到在场记录，需要重新获取卡信息及卡状态，此时不需要再做卡信息比对
            outresult.aid = inparkedobj[0].result.aid;
            outresult.vno = inparkedobj[0].result.vno;
            outresult.parkedstatus = inparkedobj[0].result.parkedstatus;
            outresult.matchcardlist = false;
            outresult.olpayfee = inparkedobj[0].result.olpayfee;
            return restler.postAsync(cardinfourl,{data:{jsondata:outresult}});   
          }
        }
      })
      .then(function(outcardobj){
        if(outresult.roadtype == 1){
          if(outcardobj&&(outcardobj[1].statusCode == 200)){
            outresult.cardtypeid = outcardobj[0].result.cardtypeid;
            outresult.cardtype = outcardobj[0].result.cardtype;
            outresult.cardid = outcardobj[0].result.cardid;
            outresult.feetype = outcardobj[0].result.feetype;
            outresult.feetypeid = outcardobj[0].result.feetypeid;
            outresult.cardstatus = outcardobj[0].result.cardstatus;
          }
          if((outresult.cardtypeid == 2) || (outresult.cardtypeid == 3))
            //计时卡或储值卡调用远程计费接口计算停车费用(未考虑时段月租卡等特殊卡类型)
            return restler.postAsync(parkfeeurl,{data:{jsondata:outresult}});
        }
        //到这里，卡信息及记录的比对和获取已经处理完成(还剩一个历史车牌比对逻辑没有处理)
      })
      .then(function(parkfeeobj){
        if(parkfeeobj&&(parkfeeobj[1].statusCode == 200)){
          //获取停车实缴费用
          outresult.parkfee = parkfeeobj[0].result.parkfee;
          //outresult.actpayfee = outresult.parkfee - outresult.olpayfee;
          outresult.waitforpayfee = outresult.parkfee - outresult.olpayfee;
        }
        //远程调用获取车辆的通行控制状态及回调信息(控制指令、语音、显示)
        return restler.postAsync(passStatusurl,{data:{jsondata:outresult}});
      })
      .then(function(passobj){
        //正常情况下，每台进出场的车处理流程都要走到这一步，被过滤掉的车牌除外
        if(passobj&&(passobj[1].statusCode == 200)){
          if(passobj[0].result.passStatus == 2){
            outresult.passStatus = passobj[0].result.passStatus;
            //判断支付类型，调用远程支付接口或等待车主支付
            switch(outresult.paytype){
              case 0:
                //无感支付
                //return restler.postAsync(lxmemberpayurl,{data:{jsondata:outresult}});
                return doMemberPayRequest(outresult);
              case 1:
                //即时线上支付
                //return restler.postAsync(lxruntimeolpayurl,{data:{jsondata:outresult}});
                return doRuntimeOLPayRequest(outresult);
            }
          }
        }
      })
      .then(function(parkfeeobj){
        console.log('parkfeeobj ');
        //更新记录，进行摄像机结果回调
        var bPass = false;
        switch(outresult.passStatus){
          case 0:
            bPass = true;
            break;
          case 4:
            bPass = false;
            break;
          default:
            bPass = true;
            break;
        }
        if(outresult.roadtype == 0){
          //sockreq.sockarrex[0].emit('users',{number:outresult.vno});
          var sockmap = sockreq.sockmap.get(pid);
          var carpassdata = {};
          carpassdata.aid = outresult.aid;
          carpassdata.vno = outresult.vno;
          carpassdata.entertime = outresult.entertime;
          carpassdata.entr = outresult.entr;
          carpassdata.cardtype = outresult.cardtype;
          sockmap.emit('carpass',{passdata: JSON.stringify(carpassdata)});
          /*
          sockreq.sock.on('connection',function(socket){
            console.log('入场推送' + outresult.vno);
            socket.emit('users',{number:outresult.vno});
          });*/
        }
        else{
          if(parkfeeobj){
            if(parkfeeobj.ret == 0){
              //支付成功，返回控制指令及串口信息，需要考虑接口调用失败后重新做远程支付接口调用的情况
              outresult.actpayfee = outresult.waitforpayfee;
              bPass = true;
            }
            else{
              //支付失败，返回
              bPass = true;

            }
          }
        }

        if(bPass){
          response.info = 'ok';
          response.content = 'test';
          response.is_pay = 'true';
          response.serialData = serialdata;
          result.Response_AlarmInfoPlate = response;
          //更新通行记录，可以考虑走单独的处理流程，跟踪记录更新的状态
          //上传图片到阿里云OSS
          var filename = vno + '_' + aid + '.jpg';
          if(outresult.roadtype == 0){
            filelist[0] = 'http://park.oss-cn-shenzhen.aliyuncs.com/enter/'+filename;
            outresult.filelist = filelist;
            addRecord(outresult);
            //在场记录入redis缓存，定义为全局变量更合理
            var redinpark = redisHelper.createClient();
            redinpark.sadd("inpark" + pid, outresult.vno);
            Common.putfile_ali(dataobj.AlarmInfoPlate.result.PlateResult.imageFile, filename, 'enter/');
          }
          else{
            if(outresult.parkedstatus == 2){
              //无入场记录，生成虚拟入场记录
              addRecord(outresult);
            }
            //
            filelist[0] = 'http://park.oss-cn-shenzhen.aliyuncs.com/exit/'+filename;
            Vaccess.updateAll({"vno":outresult.vno,"exit":""},{"exit":devicename,"exittime":time,"parkfee":outresult.parkfee,"actpayfee":outresult.actpayfee,"exitpic":filelist},function(err,info){
              if(err)
              {
                console.log('data 更新出场记录失败 ' + err);
              }
              else{
                console.log('data 更新出场记录成功 ');
              }               
            })
            //删除redis缓存中的在场记录
            var redinpark = redisHelper.createClient();
            redinpark.srem("inpark"+pid, outresult.vno);
            Common.putfile_ali(dataobj.AlarmInfoPlate.result.PlateResult.imageFile, filename, 'exit/');
          }
        }
        else{
          if(outresult.passStatus == 2){
            if(!bPass){
              console.log(outresult.vno + '支付失败 ');
            }
          }
          response.info = 'no';
          response.content = 'test';
          response.is_pay = 'false';
          response.serialData = serialdata;
          result.Response_AlarmInfoPlate = response;
        }
        cb(null, result);
      })
      .catch(function(err){
        if(err == "breaksignal"){
          cb(null,result);
        }
        else{
          console.log('promiss异常 ' + err + JSON.stringify(result));
          cb(null, result);
        }
      })
  }

  function calcParkFee(dataobj){
    return new Promise(function(resovle,reject){
      var result = {};
      result.parkfee = 0.01
      return resovle(result);
    })
  }

  function doMemberPayRequest(dataobj){
    var result = {};
    var jsondata = {};
    jsondata.pid = dataobj.pid;
    jsondata.pname = '测试';
    jsondata.thirdparkid = dataobj.pid;
    jsondata.vno = '湘A922LF';
    jsondata.entertime = dataobj.entertime;
    jsondata.exittime = dataobj.exittime;
    jsondata.thirdflag = 'ccbwx';
    jsondata.totalfee = dataobj.waitforpayfee;

    return new Promise(function(resovle, reject){
      restler.postAsync(memberpayurl,{data:jsondata})
        .then(function(data){
          if(data[1]){
            if(data[1].statusCode == 200){
              result.ret = 0;
              console.log('doMemberPayRequest 无感支付成功 ' + jsondata.vno);
              resovle(result);
            }
            else{
              var ticknum = 0;
              var memberpaytimer = setInterval(function(){
                if(ticknum<4){
                  ticknum++;
                  console.log('doMemberPayRequest 调用无感支付 ' + ticknum);
                  return restler.post(memberpayurl,{data:{jsondata:jsondata}})
                    .on('success',function(data){
                      data = JSON.parse(data);
                      if(data && data.ret == 0){
                        ticknum = 4;
                        result.ret = 0;              
                        console.log('doMemberPayRequest 无感支付成功 ' + ticknum);                       
                        //clearInterval(memberpaytimer);
                        resovle(result);
                        clearInterval(memberpaytimer);
                      }
                    })
                }
                else{
                  result.ret = -1;
                  console.log('doMemberPayRequest 无感支付超时 ' + ticknum);
                  //clearInterval(memberpaytimer);
                  resovle(result);
                  clearInterval(memberpaytimer);
                }
              },5000);
            }
          }
        })
        .catch(function(err){
          console.log('doMemberPayRequest 无感支付失败 ' + err);
          reject(err);
        })
    });
  }

  this.getMemberPayMess = function(dataobj, cb){
    doMemberPayRequest(dataobj)
      .then(function(data){
        cb(null, data);
      })
      .catch(function(err){
        console.log('getMemberPayMess 无感支付异常 ' + err);
      })
  }

  function doRuntimeOLPayRequest(dataobj){
    //离场扫码支付等即时线上支付
    var result = {};
    var Vaccess = app.models.Vaccess;
    return new Promise(function(resovle, reject){
      //Vaccess.findOne({where:{"pid":dataobj.pid,"parkid":dataobj.parkid,"vno":dataobj.vno,"exit":""}})
      Vaccess.findOne({where:{"aid":dataobj.aid}})
        .then(function(parkedobj){
          if(parkedobj){
            if(parkedobj.olpayfee + dataobj.actpayfee == dataobj.parkfee){
              result.ret = 0;
              result.content = '支付成功';
              resovle(result);              
            }
            else{
              var ticknum = 0;
              var runtimepaytimer = setInterval(function(){
                //支付超时等待2分钟
                if(ticknum<10){
                  ticknum++;
                  //Vaccess.findOne({where:{"pid":dataobj.pid,"parkid":dataobj.parkid,"vno":dataobj.vno,"exit":""}})
                  Vaccess.findOne({where:{"aid":dataobj.aid}})
                    .then(function(parkedobj){
                      console.log(parkedobj.vno + '即时支付 ' + ticknum);
                      //线上如果做过场内优惠，这地方需要改进
                      if(parkedobj.olpayfee + dataobj.actpayfee == dataobj.parkfee){
                        ticknum = 60;
                        result.ret = 0;   
                        result.content = '支付成功';
                        resovle(result);
                        clearInterval(runtimepaytimer);
                        console.log('即时支付成功 ' + ticknum);
                      }
                    })
                    .catch(function(err){
                      console.log('即时支付失败 ticknum ' + ticknum + ' ' + err);
                      reject(err);
                    })
                }
                else{
                  result.ret = -1;
                  result.content = '支付超时';
                  resovle(result);
                  clearInterval(runtimepaytimer);
                }
              },2000);
            }
          }
          else{
            console.log(dataobj.vno + '未找到在场记录，无法完成支付 ');
            result.ret = -1;
            result.content = '无在场记录';
            resovle(result);
          }
        })
        .catch(function(err){
          reject(err);
          console.log('即时支付失败 ' + err);
        })
    })
  }

  this.getRuntimeOLPayMess = function(dataobj, cb){

    doRuntimeOLPayRequest(dataobj)
    .then(function(data){
      cb(null, data);
    })
    .catch(function(err){
      console.log('getRuntimeOLPayMess 即时支付异常 ' + err);
    })
  }

  this.getParkFee = function(dataobj, cb){
      console.log('getParkFee 10s处理完毕');
      console.log('getParkFee dataobj ' + dataobj.vno);
      var result = {};
      result.ret = 0;
      result.parkfee = 0.01;
      cb(null, result);
  }

  this.getParkingConfigure = function(dataobj, cb){
    //获取车辆通行时的系统参数及卡对应的设置参数
    var result = {};
    console.log('getParkingConfigure ' + dataobj);
    cb(null,result);
  }

  this.getPassStatus = function(dataobj, cb){
    var result = {};
    //根据卡状态及通行记录状态及设置的通行参数进行通行控制状态(passStatus)的判断
    //passStatus:0自动通行，1人工确认，2收费窗口(远程调用扣费接口)，3筛选窗口，4禁止通行，-1车牌被过滤(这一步可以放到更前面进行处理)
    //调用远程的设置参数接口
    switch(dataobj.parkedstatus){
      case 0:
      case 1:
      case 2:
      case 8:
        result.passStatus = 0;
        break;
    }
    if(dataobj.roadtype == 0){
      //dataobj.parkedstatus = 0;
    }
    else{
      switch(dataobj.cardtypeid){
        case 1:
        case 4:
          result.passStatus = 0;
          break;
        case 2:
        case 3:
          if(dataobj.waitforpayfee > 0)
            result.passStatus = 2;
          break;
        default:
          result.passStatus = 0;
          break;
      }
    }
    cb(null, result);
  }

  this.getVaccessInPark = function(dataobj, cb){
    console.log('getVaccessInPark请求 ' + dataobj);
    var result = {};
    result.aid = "";
    result.vno = dataobj.vno;
    //车辆记录状态：0正常，1还在场内，2无入场记录，3车位满禁止入场，4场内过期，5场内续费，6无通行权限，7过期需人工确认放行，8自动放行，9禁止通行，10车辆已锁定，
    //11时间段禁止通行，12黑名单，13需人工确认，14需人工筛选，15未设定计费方案，16数据库连接失败
    result.parkedstatus = 0;  
    var Vaccess = app.models.Vaccess;
    Vaccess.findOne({where:{and:[{parkid:dataobj.parkid},{vno:dataobj.vno},{exit:""}]}})
    //Vaccess.findOne({where:{and:[{pid:dataobj.pid},{parkid:dataobj.parkid},{vno:dataobj.vno},{exit:""}]}})
      .then(function(parkedobj){
        if(parkedobj){
          result = parkedobj;
          return Promise.reject("breaksignal");
        }
        else{
          console.log('getVaccessInPark 未找到在场记录 ');
          if(!dataobj.matchinparklist){
            //无在场记录，返回
            result.parkedstatus = 2;
            return Promise.reject("breaksignal");
          }
          else{
            //无在场记录，进行入场记录比对
            console.log('getVaccessInPark 未获取在场记录，出场进行入场记录比对 ');
            return doInParkLicenseMatch(dataobj.vno);
          }
        }
      })
      .then(function(matchobj){
        console.log('getVaccessInPark matchobj ' + matchobj.vno);          
        if(matchobj){
          if(!matchobj.match){
            result.parkedstatus = 2;
            //没有符合比对条件的入场记录
            return Promise.reject("breaksignal");
          }
          else{
            //比对成功,重新获取车牌对应的卡信息，重新调用接口，不再进行比对
            result.vno = matchobj.vno;
            result.matchinparklist = false;
            //return restler.postAsync(parkedinparkurl,{data:{jsondata:result}});
            return Vaccess.findOne({where:{"pid":dataobj.pid,"parkid":dataobj.parkid,"vno":result.vno,"exit":""}})
          }
        }
        return Promise.reject("breaksignal");
      })
      .then(function(parkedobj){
        if(parkedobj){
          cb(null,parkedobj);
        }
      })
      .catch(function(err){
        if(err == "breaksignal"){
          cb(null,result);
        }
        else{
          console.log('getVaccessInPark异常 ' + err);
        }
      })
  }

  this.getInRecordByPark = function(dataobj, cb){
    console.log('getInRecordByPark请求 ' + dataobj);
    var result = {};
    var Vaccess = app.models.Vaccess;
    console.log('getInRecordByPark请求 ' + dataobj.pid);
    console.log('getInRecordByPark请求 ' + dataobj.vno);
    var wherestr = {"pid":dataobj.pid,"vno": "湘A11141"};
    var _qParams = [];
    //_qParams.pid = dataobj.pid;
    _qParams.vno = "湘A11141";
    Vaccess.find({where:{cardtypeid : "2"}})
      .then(function(recordlist){
        result.data = recordlist;
        result.retcode = 0;
        cb(null, result);
      })
      .catch(function(err){
        if(err.retcode == 0){
          result.retcode = err.retcode;
          result.message = err.message;
          result.data = err.data;
        }
        else{
          result.message = err;
          result.retcode = -1;
        }
        cb(null, result);
      })
  }

  this.getInRecordByAid = function(dataobj, cb){
    var result = {};
    var Vaccess = app.models.Vaccess;
    console.log('getInRecordByAid请求 ' + dataobj.aid);
    Vaccess.findOne({where: {aid : dataobj.aid}})
      .then(function(recordobj){
        if(recordobj){
          result.data = recordobj;
          result.retcode = 0;
        }
        else{
          result.message = "记录不存在";
          result.retcode = -1;
        }
        cb(null, result);
      })
      .catch(function(err){
        if(err.retcode == 0){
          result.retcode = err.retcode;
          result.message = err.message;
          result.data = err.data;
        }
        else{
          result.message = err;
          result.retcode = -1;
        }
        cb(null, result);
      })
  }

  this.userlogin = function(dataobj, cb){
    var result ={};
    var user = app.models.user;
    console.log(dataobj.name);
    user.findOne({where:{name: dataobj.name}})
      .then(function(userobj){
        if(userobj){
          result.dataobj = userobj;
          result.retcode = 0;
        }
        else{
          result.message = '用户信息不存在';
          result.retcode = -1;
        }
        cb(null, result);
      })
      .catch(function(err){
        result.message = err;
        result.retcode = -1;
        cb(null, result);
      })
  }

  function doInParkLicenseMatch(license){
    var cache = [];
    //出场，在入场记录中进行车牌比对
    //var MongoClient = require('mongodb').MongoClient;
    //var url='mongodb://127.0.0.1:27017/lebo';
    console.log('开始doInParkLicenseMatch ');   
    return new Promise(function(resovle, reject){
      var redinpark = redisHelper.createClient();
      redinpark.smembers("inpark"+pid)
        .then(function(reslist){
          for(var i =0; i < reslist.length; i++){
            cache.push(reslist[i]);
          }
          return cache;
        })
        .then(function(matchlist){
          resovle(doMatchLicenseMatch(cache,license));
        })
        .catch(function(err){
          reject(err);
        })
    });
  }

  this.getCardInfo = function(dataobj, cb){
      var result = {};
      var Cardinfo = app.models.cardinfo;
      result.vno = dataobj.vno;
      result.cardtypeid = 2;
      result.cardtype = '计时卡';
      result.cardid = '车牌计费';
      result.feetype = '计时1';
      result.feetypeid = 1;
      result.hasmatchcard = false;
      result.cardstatus = 0;  //卡状态：0正常，1不存在，2未启用，3卡过期，4余额不足，5多进多出，6过期转计时卡，7时段月租卡，8临时卡未设定默认计费方案，9到期提醒，10余额提醒

      Cardinfo.findOne({where:{"mainlicense":dataobj.vno}})
        .then(function(cardobj){
          if(cardobj){
            result.cardtypeid = cardobj.cardtypeid;
            result.cardtype = cardobj.cardtype;
            result.cardid = cardobj.cardid;
            result.feetype = cardobj.feetype;
            result.feetypeid = cardobj.feetypeid;
            result.matchcardlist = false;
            console.log('getCardInfo 获取到卡信息 ' + result.cardtype);
            //获取卡状态
            return Promise.reject("breaksignal");
          }
          else{
            console.log('getCardInfo 未获取到卡信息 ');
            if(!dataobj.matchcardlist){
              result.cardstatus = 1;
              return Promise.reject("breaksignal");
            }
            else{
              //车牌比对
              console.log('getCardInfo 未获取到卡信息，入场进行卡信息比对 ');
              return doCardLicenseMatch(dataobj.vno);  
            }
          }
        })
        .then(function(matchobj){
          console.log('getCardInfo matchobj ' + matchobj.vno);          
          if(matchobj){
            if(!matchobj.match){
              result.cardstatus = 1;
              return Promise.reject("breaksignal");
            }
            else{
              //比对成功,重新获取车牌对应的卡信息，重新调用接口，不再进行比对
              result.vno = matchobj.vno;
              result.matchcardlist = false;
              result.hasmatchcard = true;
              return Cardinfo.findOne({where:{"mainlicense":result.vno}})
              //return restler.postAsync(cardinfourl,{data:{jsondata:result}});
            }
          }
        })
        .then(function(cardobj){
          if(cardobj){
            result.cardtypeid = cardobj.cardtypeid;
            result.cardtype = cardobj.cardtype;
            result.cardid = cardobj.cardid;
            result.feetype = cardobj.feetype;
            result.feetypeid = cardobj.feetypeid;
            console.log('getCardInfo 比对后重新获取到卡信息 ' + result.cardtype);            
          }
          cb(null,result);          
        })
        .catch(function(err){
          if(err == "breaksignal"){
            cb(null,result);
          }
          else{
            console.log('collection异常 ' + err);
          }
        });
  }

  function doLotsWork(records,callback){
    //.....do lots of work
    //.....
    //all done, ready to deal with next 10 records
    process.nextTick(function(){
    callback();
    });
  }

  function doCardLicenseMatch(license){
    var cache = [];
    //入口，在卡信息、历史车牌识别库中进行比对
    var MongoClient = require('mongodb').MongoClient;
    var url='mongodb://127.0.0.1:27017/lebo';
    console.log('开始doCardLicenseMatch ');
    return new Promise(function(resovle,reject){
      MongoClient.connect(url, function(err, client) {
        if(err){
          console.log('入场doCardLicenseMatch ' + err);
          reject(err);
        }
        else{
          console.log('入场doCardLicenseMatch ');
          cache.push('鄂F49284');
          cache.push('鲁MZ665B');
          cache.push('鄂F49287');
          Promise.all(cache)
            .then(function(result){
              console.log('开始获取doLicenseMatch的Promise'); 
              resovle(doMatchLicenseMatch(cache,license));
            })
            .catch(function(err){
              console.log('获取doLicenseMatch的Promise失败' + err); 
              reject(err);
            })
        }
      }); 
    });
  }

  function doMatchLicenseMatch(licenselist,license){
    var idiff = 7;
    var matchresult = {};
    console.log('准备返回doLicenseMatch'); 
    console.log('licenselist ' + licenselist.length); 
    return new Promise(function(resovle, reject){
      for(var listlen = 0; listlen < licenselist.length; listlen++){
        console.log('licenselist ' + licenselist[listlen]);
        (function(listlen){
          idiff = doJudgeLicenseMatch(license, licenselist[listlen], true);
          console.log('doMatchLicenseMatch diff ' + idiff);
        })(listlen);
        if (idiff <= 1){
          matchresult.diff = idiff;
          matchresult.match = true;
          matchresult.vno = licenselist[listlen];
          break;
        }
      }
      if (idiff > 1){
        matchresult.diff = idiff;
        matchresult.match = false;
        matchresult.vno = license;
      }
      Promise.all(licenselist)
        .then(function(result){
          console.log('开始返回doLicenseMatch' + matchresult.vno); 
          resovle(matchresult);
        })
        .catch(function(err){
          console.log('返回doLicenseMatch失败' + err); 
          reject(err);
        })
    })
  }

  function doJudgeLicenseMatch(srclicense, dstlicense, bmatchlib){
    var idiff = 0;
    var bmacth = false;
    //return new Promise(function(resovle, reject){
      console.log('srclicense ' + srclicense + ' dstlicense ' + dstlicense);
      if ((srclicense.length >= platelen)&&(srclicense.length == dstlicense.length)){
        if(srclicense.slice(1,6) == dstlicense.slice(1,6)){
          console.log('车牌相等');         
        }
        else{
          //循环车牌,licenselen从1开始，丢掉首汉字
          for(var licenselen = 1; licenselen < srclicense.length; licenselen++){
            var srcchar = srclicense.substr(licenselen,1);
            var dstchar = dstlicense.substr(licenselen,1);
            if(srcchar != dstchar){            
              if(bmatchlib){
                //启用易错库比对
                bmacth = false;
                //循环易错字符库               
                for(var liblen = 0; liblen < matchlibarray.length; liblen++){
                  var slib1 = matchlibarray[liblen].slice(0,1);
                  var slib2 = matchlibarray[liblen].slice(1,1);
                  if((matchlibarray[liblen].indexOf(srcchar)) && (matchlibarray[liblen].indexOf(dstchar))){
                    //存在符合易错比对的差异字符
                    bmacth = true;
                    //跳出易错库循环，继续比较车牌中的下一个字符
                    break;
                  }
                }
                if (bmacth){
                  //符合易错库比对，差异度自增
                  idiff++;
                }
                else{
                  //存在不符合易错库比对的车牌字符，跳出车牌循环
                  break;
                }
              }
              else{
                //通用比对模式
                idiff++;
              }
            }
          }
        }          
      }
      else{
        //进行比对的车牌格式非法
        idiff = 7;
      }
      console.log('doJudgeLicenseMatch diff ' + idiff);   
      return idiff;
  }

  function doHisLicenseMatch(licenselist,license,cb){
    licenselist.forEach(function(v,i,a){
      console.log(v);
      console.log(i);
      console.log(a);
      
    })
  }

  function testtimeout(){
    setTimeout(function(){
      console.log('testtimeout 开始延时20s');
    },20000);
  }

  function getCardInfo(plateobj) {
    var vno = plateobj.vno;
    var pid = plateobj.pid;
    var cardinfo = app.models.cardinfo;
    plateobj.cardstatus = 0;
    cardinfo.findOne({ where: {mainlicense: vno } })
      .then(function (cardobj) {
        if (cardobj) {
          plateobj.cardtype = cardobj.cardtype;
          plateobj.cardid = cardobj.cardid;
          plateobj.feetype = cardobj.feetype;
          plateobj.feetypeid = cardobj.feetypeid;
        }
        else {
          plateobj.cardtype = '计时卡';
          plateobj.cardid = '车牌计费';
          plateobj.feetype = '小型车';
          plateobj.feetypeid = '0';
         
        }
      })
    return plateobj;
  }

  function addRecord(plateobj) {
    var vaccess = app.models.Vaccess;
    vaccess.create({
      aid: plateobj.aid,
      pid: plateobj.pid,
      parkid: plateobj.parkid,
      vno: plateobj.vno,
      cardid: plateobj.cardid,
      cardtype: plateobj.cardtype,
      cardtypeid: plateobj.cardtypeid,
      feetype: plateobj.feetype,
      feetypeid: plateobj.feetypeid,
      entr: plateobj.entr,
      entertime: plateobj.entertime,
      exit: plateobj.exit,
      exittime: plateobj.exittime,
      operator: plateobj.operator,
      parkfee: plateobj.parkfee,
      olpayfee: plateobj.olpayfee,
      actpayfee: plateobj.actpayfee,
      paytype: plateobj.paytype,
      inremark: plateobj.inremark,
      outremark: plateobj.outremark,
      enterpic: plateobj.filelist
    })
      .then(function (obj) {
        console.log("addRecord " + plateobj.vno + "生成入场记录成功");
      })
      .catch(function(err){
        console.log("addRecord " + plateobj.vno + "生成入场记录失败" + err);
      })
  }

  function updateRecord(plateobj) {

  }

  function getRoadType(devicename) {

  }



  var requestUrl = function (host, path, callback) {
    var https = require('https');
    
    var options = {
        host: host,
        port: 443,
        path: path,
        method: 'GET'
    };
    
    var req = https.request(options, function (res) {
        console.log("statusCode: ", res.statusCode);
        console.log("headers: ", res.headers);
        
        res.on('data', function (d) {
            callback(d);
        });
    });
    req.end();
    
    req.on('error', function (e) {
        console.error(e);
    });
  };

}
