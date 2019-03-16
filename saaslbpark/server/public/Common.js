var crypto = require("crypto");
var fs = require('fs');

var co = require('co');
var OSS = require('ali-oss');
var OSSclient = new OSS({
  region: 'oss-cn-shenzhen',
  accessKeyId: 'LTAIAdk9C0zxw7zT',
  accessKeySecret: 'SdWWaBGWxLtT56Wr0Lm5NJza2EqK4L',
  bucket: 'park'
  });

var Common = {
  encrypt: function (data, key) { // 密码加密
    var cipher = crypto.createCipher("bf", key);
    var newPsd = "";
    newPsd += cipher.update(data, "utf8", "hex");
    newPsd += cipher.final("hex");
    return newPsd;
  },
  decrypt: function (data, key) { //密码解密
    var decipher = crypto.createDecipher("bf", key);
    var oldPsd = "";
    oldPsd += decipher.update(data, "hex", "utf8");
    oldPsd += decipher.final("utf8");
    return oldPsd;
  },
  AESencrypt: function (input, key, iv) {
    try {
      var data = "";
      if (typeof data === "object") {
        data = JSON.stringify(input);
      }
      else {
        data = input.toString();
      }
      var iv = iv || "";
      var clearEncoding = 'utf8';
      var cipherEncoding = 'base64';
      var cipherChunks = [];
      var cipher = crypto.createCipheriv('aes-128-ecb', key, iv);
      cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
      cipherChunks.push(cipher.final(cipherEncoding));
      var result = cipherChunks.join('');
      //var result = cipher.update(data, clearEncoding, cipherEncoding) + cipher.final(cipherEncoding);
      return result;
    } catch (err) {
      logger.console("加密token：" + input);
      logger.console("加密错误：" + err);
    }

  },
  AESdesrypt: function (data, key, iv) {
    var keys = "1234567812345678";
    var iv = iv || "";
    var clearEncoding = 'utf8';
    var cipherEncoding = 'base64';
    var cipherChunks = [];
    var decipher = crypto.createDecipheriv('aes-128-ecb', keys, iv);
    decipher.setAutoPadding(true);
    //cipherChunks.push(decipher.update(data, cipherEncoding, clearEncoding));
    //cipherChunks.push(decipher.final(clearEncoding));
    //var result = eval("(" + cipherChunks.join('') + ")"); //转成对象，方便程序中使用
    var result = decipher.update(data, cipherEncoding, clearEncoding) + decipher.final(clearEncoding);
    return result;
  },
  dateFormat: function (date, fmt, nullText) {
    var nullflag = date && date.getFullYear();
    if (nullflag === 1900 || !nullflag) {
      return nullText;
    }

    var o = {
      "M+": date.getMonth() + 1,                 //月份
      "d+": date.getDate(),                    //日
      "h+": date.getHours(),                   //小时
      "m+": date.getMinutes(),                 //分
      "s+": date.getSeconds(),                 //秒
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度
      "S": date.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt))
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  },
  //加法函数，用来得到精确的加法结果
  //说明：javascript的加法结果会有误差，在两个浮点数相加的时候会比较明显。这个函数返回较为精确的加法结果。
  //调用：accAdd(arg1,arg2)
  //返回值：arg1加上arg2的精确结果
  accAdd: function (arg1, arg2) {
    var r1, r2, m;
    try {
      r1 = arg1.toString().split(".")[1].length
    } catch (e) {
      r1 = 0
    }
    try {
      r2 = arg2.toString().split(".")[1].length
    } catch (e) {
      r2 = 0
    }
    m = Math.pow(10, Math.max(r1, r2))
    return (arg1 * m + arg2 * m) / m
  },
  formatCurrency: function (num) {
    num = num.toString().replace(/\$|\,/g, '');
    if (isNaN(num))
      num = "0";
    sign = (num == (num = Math.abs(num)));
    num = Math.floor(num * 100 + 0.50000000001);
    cents = num % 100;
    num = Math.floor(num / 100).toString();
    if (cents < 10)
      cents = "0" + cents;
    for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
      num = num.substring(0, num.length - (4 * i + 3)) + ',' +
        num.substring(num.length - (4 * i + 3));
    return (((sign) ? '' : '-') + num + '.' + cents);
  },

  formatTimestamp: function (Timestamp) {
    var now = new Date(parseInt(Timestamp) * 1000);
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var date = now.getDate();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
  },
  addHours: function (date, value) {
    date.setHours(date.getHours() + value);
    return date;
  },
  arrayContains: function (arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) {
        return true;
      }
    }
    return false;
  },
  arrayContains: function (arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) {
        return true;
      }
    }
    return false;
  },
  isArray: function (object) {
    return object && typeof object === 'object' &&
      Array == object.constructor;
  },
  generateOrderNumber: function () {
    var date = new Date();
    var year = date.getFullYear().toString();
    var month = (parseInt(date.getMonth()) + 1).toString();
    while (month.length < 2) {
      month = "0" + month;
    }
    ;
    var day = date.getDate().toString();
    while (day.length < 2) {
      day = "0" + day;
    }
    ;
    var hour = date.getHours().toString();
    while (hour.length < 2) {
      hour = "0" + hour;
    }
    ;
    var min = date.getMinutes().toString();
    while (min.length < 2) {
      min = "0" + min;
    }
    ;
    var sec = date.getSeconds().toString();
    while (sec.length < 2) {
      sec = "0" + sec;
    }
    ;
    var millisec = date.getMilliseconds().toString();
    while (millisec.length < 3) {
      millisec = "0" + millisec;
    }
    ;
    var temp = Math.floor(Math.random() * 900 | 0 + 100).toString();//7位随机数
    logger.console("三位位随机数：" + temp);

    var orderNumber = year + month + day + hour + min + sec + millisec + temp;
    logger.console("orderNumber:" + orderNumber);
    return orderNumber;
  },
  checkPhone: function (phoneno) { // 密码加密
    var re = /^1\d{10}$/;
    if (re.test(phoneno)) {
      return true;
    } else {
      return false;
    }
  },
  checkEmail: function (email) { //密码解密
    var re = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
    if (re.test(email)) {
      return true;
    } else {
      return false;
    }
  },
  stringReplceForJson: function (str) {
    //  str = str.replace(">", "&gt;");
    //  str = str.replace("<", "&lt;");
    //str = str.replace(" ", "&nbsp;");
    //  str = str.replace("\"", "&quot;");
    // str = str.replace("\'", "&#39;");
    //  str = str.replace("\\", "\\\\");//对斜线的转义
    // str = str.replace(/\\/g,  "\\\\");
    // str = str.replace(/\n/g,  "\\n");
    // str = str.replace(/\r/g, "\\r");

    str = str.replace(/\n/g,  "\\n");
    str = str.replace(/\r/g, "\\r");
    return str;
  },
  base64_encode: function(file){
    var bitmap = fs.readFileSync(file);
    return new Buffer(bitmap).toString('base64');
  },
  base64_decode: function(base64str, file){
    var bitmap = new Buffer(base64str, 'base64');
    fs.writeFileSync(file, bitmap);
    console.log('******** File created from base64 encoded string ********');
  },
  putfile_ali: function(imagefile, filename, subpath){
    var localfile = './' + filename;
    
    this.base64_decode(imagefile, localfile);
    co(function *(){
      var result = yield OSSclient.put(subpath + filename, localfile);
      console.log('upload:' + filename);
      //fs.unlinkSync(localfile);
    })
    .catch(function(err){
      console.log('upload:' + err);
      //fs.unlinkSync(localfile);
    });
  }
};

module.exports = Common;
