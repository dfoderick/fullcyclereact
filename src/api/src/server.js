const express = require('express');
const serveStatic = require('serve-static');
const SSE = require('sse');
const bodyParser = require('body-parser');
const redis = require('redis');
const amqp = require('amqplib/callback_api');

const app = express();
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

//todo: these should all be environment settings
const serverhost = 'localhost'
const port = process.env.PORT || 5000;
const messagebus = 'amqp://fullcycle:mining@'+serverhost
const redis_port = 6379
const redis_host = serverhost
const redis_password = 'mining'

//Message envelope for putting messages on the bus
function makeMessage(ptype, pbody){
	return {
		version: '1.1',
		sender: 'fullcyclereact',
		type: ptype,
		timestamp: new Date().toISOString(),
		body: pbody
	}
}

// MinerMessage
function makeMinerMessage(pminer, pcommand, ppool){
	return {
		miner: pminer,
		command: pcommand,
		minerstats: null,
		minerpool: ppool
	}
}

//MinerCommandMessge
function makeCommand(pcommand,pparameter){
	return {
		command: pcommand,
		parameter: pparameter
	}
}

// ConfigurationMessage
function makeConfigurationMessage(pbody){
	return {
		command: pbody.command,
		parameter: pbody.parameter,
		id: pbody.id,
		entity: pbody.entity,
		values: pbody.values
	}
}

function bail(err, conn) {
  console.error(err);
  if (conn) conn.close(function() { process.exit(1); });
}

function publish (q, msg){
	console.log(q + ' => ' + msg);

	amqp.connect(messagebus, function(err, conn) {
	  conn.createChannel(function(err, ch) {
		if (err != null) bail(err);
		ch.assertQueue(q, {durable: false});
		ch.sendToQueue(q, new Buffer(msg));
		console.log(" [x] Sent %s", msg);
	  });
	  //conn.close();
	});
}

app.get('/api/hello', (req, res) => {
	console.log('called hello')
  res.send({ express: 'Welcome to Full Cycle Mining' });
});

app.get('/api/getcamera', (req, res) => {
		console.log('called getcamera')
    getredis('camera', function(object) {
		res.send({ camera: object });;
    });
});

function redisclient(){
	var client = redis.createClient(redis_port, redis_host, {no_ready_check: true});
	client.auth(redis_password, function (err) {
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
};

function getredishashset(key, callback) {
	var client = redisclient();
	client.hgetall([key], function(err, object) {
		callback(object);
		client.quit();
	});
};

app.get('/api/knownminers', (req, res) => {
		console.log('called knownminers')
    getredishashset('knownminers', function(object) {
		res.send({ knownminers: object });;
    });
});

app.get('/api/knownpools', (req, res) => {
	console.log('called knownpools')
	getredishashset('knownpools', function(object) {
	res.send({ knownpools: object });;
	});
});

app.post('/api/sendcommand',jsonParser, (req, res) => {
	publish(req.body.command,JSON.stringify(req.body.command));
});

app.post('/api/save',jsonParser, (req, res) => {
	console.log(req.body);
	//1) make configmessage with command
	var configmsg = makeConfigurationMessage(req.body);
	//2) wrap the configmessage into an envelope
	var envelope = makeMessage('configuration', JSON.stringify(configmsg))
	publish('save',JSON.stringify(envelope));
});

app.post('/api/minerrestart',jsonParser, (req, res) => {
	console.log(req.body);
	//1) create restart minercommand
	var cmd = makeCommand(req.body.command, req.body.parameter);
	//2) make minermessage with command
	var minermsg = makeMinerMessage(req.body.miner, cmd, null);
	//3) wrap the minermessage into an envelope
	var envelope = makeMessage('minercommand', JSON.stringify(minermsg))
	publish('restart',JSON.stringify(envelope));
});

app.post('/api/minerswitchpool', jsonParser, (req, res) => {
	console.log(req.body);
	//1) create minercommand
	var cmd = makeCommand(req.body.command, req.body.parameter);
	//2) make minermessage with command
	var minermsg = makeMinerMessage(req.body.miner, cmd, null);
	//3) wrap the minermessage into an envelope
	var envelope = makeMessage('minercommand', JSON.stringify(minermsg))
	publish('switch',JSON.stringify(envelope));
});

app.get('/api/knownsensors', (req, res) => {
		console.log('called knownsensors')
    getredishashset('knownsensors', function(object) {
		res.send({ knownsensors: object });;
    });
});

//in production this serves up the react bundle
app.use(serveStatic('../web/build'));
var server = app.listen(port, () => console.log(`Listening on port ${port}`));

//set up the full cycle alerts feed to send alerts to the browser
var sse = new SSE(server);
sse.on('connection', function (sse_connection) {
	console.log('new sse connection');
	
	amqp.connect(messagebus, on_connect);

	function on_connect(err, conn) {
		if (err !== null) return bail(err);
		process.once('SIGINT', function() { conn.close(); });
	
		var ex = 'alert';
		
		function on_channel_open(err, ch) {
			if (err !== null) return bail(err, conn);
			ch.assertQueue('', {exclusive: true}, function(err, ok) {
				var q = ok.queue;
				ch.bindQueue(q, ex, '');
				ch.consume(q, logMessage, {noAck: true}, function(err, ok) {
					if (err !== null) return bail(err, conn);
					console.log(" [*] Waiting for alert. To exit press CTRL+C.");
				});
			});
		}
	
		function logMessage(msg) {
			if (msg) {
				console.log(" [x] '%s'", msg.content.toString());
				sse_connection.send({
					event: 'full-cycle-alert',
					data: msg.content.toString()
				});
			}
		}
	
		conn.createChannel(on_channel_open);
	}

	// sse_connection.send({
	// 	event: 'full-cycle-alert',
	// 	data: msg.content.toString()
	// });
	// console.log(" [x] Sent to browser '%s'", msg.content.toString());
	
  sse_connection.on('close', function () {
    console.log('lost sse connection');
		//how to close amqp conn???
		//conn.close();
  })
});

