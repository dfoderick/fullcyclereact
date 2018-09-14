
var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const redis = require('redis');
const amqp = require('amqplib/callback_api');

const services = require('./services');
const messages = require('./messages');

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

function bail(err, conn) {
    console.error('bailing...');
    console.error(err);
    if (conn) conn.close(function() {
          // if (doexit)
          // 	process.exit(1); 
      });
  }
  
function publish (q, msg){
	console.log(q + ' => ' + msg);

	amqp.connect(services.messagebus.connection, function(err, conn) {
	  conn.createChannel(function(err, ch) {
		if (err != null) { bail(err); }
		ch.assertQueue(q, {durable: false});
		ch.sendToQueue(q, new Buffer(msg));
		console.log(" [x] Sent %s", msg);
	  });
	  //conn.close();
	});
}
  
function redisclient() {
	var client = redis.createClient(services.redis.port, services.redis.host, {no_ready_check: true});
	client.auth(services.redis.password, function (err) {
		 if (err) throw err;
	});
  return client;
}

function getredis(key, callback) {
	var client = redisclient();
	client.get([key], function(err, object) {
		callback(object);
		client.quit();
	});
}

function getredishashset(key, callback) {
	var client = redisclient();
	client.hgetall([key], function(err, object) {
		callback(object);
		client.quit();
	});
};

router.get('/hello',
	// passport.authenticate('basic', { session: false }),
	(req, res) => {
		console.log("called hello")
  		res.send({ express: 'Welcome to Full Cycle Mining' });
	});

router.get('/getcamera', 
	// passport.authenticate('basic', { session: false }),
	(req, res) => {
		console.log('called getcamera')
    	getredis('camera', function(object) {
		res.send({ camera: object });;
    })
});


router.get('/knownminers', 
//	passport.authenticate('basic', { session: false }),
	(req, res) => {
		console.log('called knownminers')
    	getredishashset('knownminers', function(object) {
			res.send({ knownminers: object });;
    	})
	});

router.get('/knownpools', 
//	passport.authenticate('basic', { session: false }),
	(req, res) => {
		console.log('called knownpools')
		getredishashset('knownpools', function(object) {
			res.send({ knownpools: object });
		});
	});

router.post('/sendcommand',jsonParser, (req, res) => {
	publish(req.body.command,JSON.stringify(req.body.command));
});

router.post('/save',jsonParser, (req, res) => {
	console.log(req.body);
	//1) make configmessage with command
	var configmsg = messages.makeConfigurationMessage(req.body);
	//2) wrap the configmessage into an envelope
	var envelope = messages.makeMessage('configuration', JSON.stringify(configmsg))
	publish('save',JSON.stringify(envelope));
});

router.post('/minerrestart',jsonParser, (req, res) => {
	console.log(req.body);
	//1) create restart minercommand
	var cmd = messages.makeCommand(req.body.command, req.body.parameter);
	//2) make minermessage with command
	var minermsg = messages.makeMinerMessage(req.body.miner, cmd, null);
	//3) wrap the minermessage into an envelope
	var envelope = messages.makeMessage('minercommand', JSON.stringify(minermsg))
	publish('restart',JSON.stringify(envelope));
});

router.post('/minerswitchpool', jsonParser, (req, res) => {
	console.log(req.body);
	//1) create minercommand
	var cmd = messages.makeCommand(req.body.command, req.body.parameter);
	//2) make minermessage with command
	var minermsg = messages.makeMinerMessage(req.body.miner, cmd, null);
	//3) wrap the minermessage into an envelope
	var envelope = messages.makeMessage('minercommand', JSON.stringify(minermsg))
	publish('switch',JSON.stringify(envelope));
});

router.get('/knownsensors', 
//passport.authenticate('basic', { session: false }),
(req, res) => {
	console.log('called knownsensors');
    getredishashset('knownsensors', function(object) {
		res.send({ knownsensors: object });;
    });
});

module.exports = router;
