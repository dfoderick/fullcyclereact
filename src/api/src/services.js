
var config = {};

config.web = {};
config.redis = {};
config.messagebus = {};
config.auth = {}

config.web.host = 'localhost'
config.web.port = process.env.PORT || 5000;
config.messagebus.connection = 'amqp://fullcycle:mining@' + config.web.host
config.redis.host = config.web.host
config.redis.port = 6379
config.redis.password = ''
config.auth.secret = 'proof_of_work'

module.exports = config;
