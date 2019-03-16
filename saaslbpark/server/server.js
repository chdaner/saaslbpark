'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var app = module.exports = loopback();
var io = require('socket.io').listen(8081);
module.exports.sock = io;
var sockarr = [];
module.exports.sockarrex = sockarr;
var myMap = new Map();
module.exports.sockmap = myMap;

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit : "2mb"}));
app.use(bodyParser.urlencoded({limit: '2mb', extended: true}));
app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();

  io.on('connection',function(socket){
    socket.on('login', function(data){
      //sockarr[0] = socket;
      myMap.set(data.username, socket);
      console.log('login' + data);
    })
    socket.emit('users',{number:'number'});
  });
})
