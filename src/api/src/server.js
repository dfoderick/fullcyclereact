"use strict";

const express = require('express');
const serveStatic = require('serve-static');
const bodyParser = require('body-parser');
const path = require("path");
const SSE = require('sse');
const redis = require('redis');
const amqp = require('amqplib/callback_api');
const bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
//const User = require("../models/user");

const encryptedpassword = "$2a$10$RxKTlL9YMMwEE./jBaYP.u0PL8omTKXy9mynRvFzvd0fDtjHIG7ou";
const jsonParser = bodyParser.json();
const app = express();

// const passport = require('passport')    
// const BasicStrategy = require('passport-http').BasicStrategy
// passport.use(new BasicStrategy(
// 	function(username, password, done) {
// 		//todo: obviously needs to change
// 	  	if (username.valueOf() === 'fullcycle' && password.valueOf() === 'mining')
// 			return done(null, true);
// 		  else
// 		  {
// 			console.log("rejected!")
// 			return done(null, false);
// 		  }
// 	}
//   ));

const services = require('./services');
const messages = require('./messages');

var api = require('./api.js');

function bail(err, conn) {
  console.error('bailing...');
  console.error(err);
  if (conn) conn.close(function() {
		// if (doexit)
		// 	process.exit(1); 
	});
}

function comparePassword (passw, cb) {
    bcrypt.compare(passw, encryptedpassword, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
	});
}
	
app.post('/api/auth/login', jsonParser, function(req, res) {
		// check if password matches
		let user = {username:req.body.password, password:req.body.password}
		comparePassword(req.body.password, function (err, isMatch) {
		  if (isMatch && !err) {
			// if user is found and password is right create a token
			var token = jwt.sign(user, services.auth.secret);
			// return the information including token as JSON
			res.json({success: true, token: 'JWT ' + token});
		  } else {
			res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
		  }
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
app.use(serveStatic('../web/build') 
//,
//	passport.authenticate('basic', { session: false })
);
app.use('/api', api);
var server = app.listen(services.web.port, () => console.log(`Listening on port ${services.web.port}`));
server.on('listen', onWebListen);

function onWebListen() {
	var addr = server.address();
	var bind = typeof addr === 'string'
	  ? 'pipe ' + addr
	  : 'port ' + addr.port;
	debug('Listening on ' + bind);
	// let plainpassword = 'mining'
	// bcrypt.genSalt(10, function (err, salt) {
	// 	if (err) {
	// 		return false;
	// 	}
	// 	bcrypt.hash(plainpassword, salt, null, function (err, hash) {
	// 		if (err) {
	// 			return false;
	// 		}
	// 		user.password = hash;
	// 	});
	// });
	
  }


server.on('error', onWebError);

function onWebError(error) {
	if (error.syscall !== 'listen') {
	  throw error;
	}
  
	var bind = typeof port === 'string'
	  ? 'Pipe ' + port
	  : 'Port ' + port;
  
	// handle specific listen errors with friendly messages
	switch (error.code) {
	  case 'EACCES':
		console.error(error.code + ':' + bind + ' requires elevated privileges');
		process.exit(1);
		break;
	  case 'EADDRINUSE':
		console.error(error.code + ':' + bind + ' is already in use. Close the other app and try again');
		process.exit(1);
		break;
	  default:
		throw error;
	}
  }

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
