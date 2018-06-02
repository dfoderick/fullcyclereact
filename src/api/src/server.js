"use strict";

const express = require('express');
const serveStatic = require('serve-static');
const path = require("path");
const SSE = require('sse');
const bodyParser = require('body-parser');
const redis = require('redis');
const amqp = require('amqplib/callback_api');

const app = express();
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

const services = require('./services');
const messages = require('./messages');

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
	var configmsg = messages.makeConfigurationMessage(req.body);
	//2) wrap the configmessage into an envelope
	var envelope = messages.makeMessage('configuration', JSON.stringify(configmsg))
	publish('save',JSON.stringify(envelope));
});

app.post('/api/minerrestart',jsonParser, (req, res) => {
	console.log(req.body);
	//1) create restart minercommand
	var cmd = messages.makeCommand(req.body.command, req.body.parameter);
	//2) make minermessage with command
	var minermsg = messages.makeMinerMessage(req.body.miner, cmd, null);
	//3) wrap the minermessage into an envelope
	var envelope = messages.makeMessage('minercommand', JSON.stringify(minermsg))
	publish('restart',JSON.stringify(envelope));
});

app.post('/api/minerswitchpool', jsonParser, (req, res) => {
	console.log(req.body);
	//1) create minercommand
	var cmd = messages.makeCommand(req.body.command, req.body.parameter);
	//2) make minermessage with command
	var minermsg = messages.makeMinerMessage(req.body.miner, cmd, null);
	//3) wrap the minermessage into an envelope
	var envelope = messages.makeMessage('minercommand', JSON.stringify(minermsg))
	publish('switch',JSON.stringify(envelope));
});

app.get('/api/knownsensors', (req, res) => {
	console.log('called knownsensors');
    getredishashset('knownsensors', function(object) {
		res.send({ knownsensors: object });;
    });
});

//route all other calls to the home page. this is causing "path is not defined" in line 179
// app.get('/*', function(req, res) {
//   res.sendFile(path.join(__dirname, '/index.html'), function(err) {
//     if (err) {
//       res.status(500).send(err)
//     }
//   })
// });

//in production this serves up the react bundle
app.use(serveStatic('../web/build'));
var server = app.listen(services.web.port, () => console.log(`Listening on port ${services.web.port}`));

var bus_connect = null;

function on_connect(err, conn) {
	if (err !== null) return bail(err);
	process.once('SIGINT', function() { conn.close(); });

	bus_connect = conn;

}

//set up the full cycle alerts feed to send alerts to the browser
var sse = new SSE(server);
sse.on('connection', function (sse_connection) {
	console.log('new sse connection');
	
	const q_alert = 'alert';
	let alert_channel = null;

	function on_channel_open_alert(err, ch) {
		if (err !== null) return bail(err, bus_connect);
		alert_channel = ch;
		ch.on('error', function (err) {
			console.error(err)
			console.log('channel Closed');
		});
		ch.assertQueue('', {exclusive: true}, function(err, ok) {
			var q = ok.queue;
			ch.bindQueue(q, q_alert, '');
			ch.consume(q, alertMessage, {noAck: true}, function(err, ok) {
				if (err !== null) return bail(err, bus_connect);
				console.log(" [*] Waiting for alert. To exit press CTRL+C.");
			});
		});
	}

	function alertMessage(msg) {
		if (msg) {
			//msg.content.toString()
			console.log(" [x] '%s'", "received alert message");
			sse_connection.send({
				event: 'full-cycle-alert',
				data: msg.content.toString()
			});
		}
	}

	const q_miner = 'statisticsupdated';
	let miner_channel = null;
	function on_channel_open_miner(err, ch) {
		if (err !== null) return bail(err, bus_connect);
		miner_channel = ch;
		ch.on('error', function (err) {
			console.error(err)
			console.log('miner channel Closed');
		});
		ch.assertQueue('', {exclusive: true}, function(err, ok) {
			var q = ok.queue;
			ch.bindQueue(q, q_miner, '');
			ch.consume(q, minerMessage, {noAck: true}, function(err, ok) {
				if (err !== null) return bail(err, bus_connect);
				console.log(" [*] Waiting for miner stats. To exit press CTRL+C.");
			});
		});
	}

	function minerMessage(msg) {
		if (msg) {
			//msg.content.toString()
			console.log(" [x] '%s'", "received miner message");
			sse_connection.send({
				event: 'full-cycle-miner',
				data: msg.content.toString()
			});
		}
	}

	const q_sensor = 'sensor';
	let sensor_channel = null;
	function on_channel_open_sensor(err, ch) {
		if (err !== null) return bail(err, bus_connect);
		sensor_channel = ch;
		ch.on('error', function (err) {
			console.error(err)
			console.log('sensor channel Closed');
		});
		ch.assertQueue('', {exclusive: true}, function(err, ok) {
			var q = ok.queue;
			ch.bindQueue(q, q_sensor, '');
			ch.consume(q, sensorMessage, {noAck: true}, function(err, ok) {
				if (err !== null) return bail(err, bus_connect);
				console.log(" [*] Waiting for sensor. To exit press CTRL+C.");
			});
		});
	}

	function sensorMessage(msg) {
		if (msg) {
			//msg.content.toString()
			console.log(" [x] '%s'", "received sensor message");
			sse_connection.send({
				event: 'full-cycle-sensor',
				data: msg.content.toString()
			});
		}
	}

	if (bus_connect)
	{
		bus_connect.createChannel(on_channel_open_alert);
		bus_connect.createChannel(on_channel_open_miner);
		bus_connect.createChannel(on_channel_open_sensor);
	}
	
  sse_connection.on('close', function () {
    console.log('lost sse connection');
		if (alert_channel) alert_channel.close();
		if (miner_channel) miner_channel.close();
		if (sensor_channel) sensor_channel.close();
	});
	
});

try {
	amqp.connect(services.messagebus.connection, on_connect);
}
catch(error) {
	console.error(error);
}
