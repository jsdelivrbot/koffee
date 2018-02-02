var PrivateAPI = require('instagram-private-api').V1;



// this will run socket server 8888

var ClientProxy = PrivateAPI.ProxyClient;
var server = new ClientProxy.Server('0.0.0.0', '8080', '8888');
var session = new ClientProxy.Session(server);

session.create('some instagram username', 'somepass')
    .then(function(session) {
         ClientProxy.Thread.subscribeAll(session, function(thread){
               // this -> socket connection
               console.log(thread, "thread change")
          })
    });
    server.run({
        port: 8080,
        socketPort: 8888,
        host: "0.0.0.0",
        databaseDir: './databases',
        cookiesDir: './cookies'
    });
