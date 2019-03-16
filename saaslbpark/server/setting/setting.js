function setting(){
    this.ENV = "TEST";

    this.setting = {
        redis_host:'127.0.0.1',
        redis_port:6379,
        redis_pwd:''
    }
    
    this.io = require('socket.io').listen(8080);
}

var setEntity = new setting();

exports.setting = setEntity.setting