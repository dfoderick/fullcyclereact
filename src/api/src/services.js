
var config = {};

config.web = {};
config.redis = {};
config.messagebus = {};

config.web.host = "localhost";
config.web.port = process.env.PORT || 5000;
config.messagebus.connection = "amqp://fullcycle:mining@" + config.web.host
config.redis.host = config.web.host
config.redis.port = 6379
config.redis.password = ""

module.exports = config;
