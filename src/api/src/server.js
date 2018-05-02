const express = require('express');
const serveStatic = require('serve-static');
const bodyParser = require('body-parser');
const redis = require('redis');
const amqp = require('amqplib/callback_api');

const app = express();
// create application/json parser
const jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });

//todo: these should all be environment settings
const serverhost = 'localhost'
const port = process.env.PORT || 5000;
const messagebus = 'amqp://fullcycle:mining@'+serverhost
const redis_port = 6379
const redis_host = serverhost

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

function bail(err) {
  console.error(err);
  process.exit(1);
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

function getredishashset(key, callback) {
	var client = redis.createClient(redis_port, redis_host, {no_ready_check: true});
	client.auth('mining', function (err) {
		 if (err) throw err;
	});
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
app.listen(port, () => console.log(`Listening on port ${port}`));
