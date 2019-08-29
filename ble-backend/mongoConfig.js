var mongoose = require('mongoose');

//mongo config
  mongoose.Promise = global.Promise;

  var localDb = mongoose.connection;

  localDb.on('connecting', function () {
    console.log('connecting to MongoDB...');
  });

  localDb.on('error', function (error) {
    console.error('Error in MongoDb connection: ' + error);
    mongoose.disconnect();
  });
  localDb.on('connected', function () {
    console.log('MongoDB connected!');
  });
  localDb.once('open', function () {
    console.log('MongoDB connection opened!');
  });
  localDb.on('reconnected', function () {
    console.log('MongoDB reconnected!');
  });
  localDb.on('disconnected', function () {
    console.log('MongoDB disconnected!');
    mongoose.connect('mongodb://shivanu31:shivanu31@hackathon-shard-00-00-w8piq.mongodb.net:27017,hackathon-shard-00-01-w8piq.mongodb.net:27017,hackathon-shard-00-02-w8piq.mongodb.net:27017/test?ssl=true&replicaSet=hackathon-shard-0&authSource=admin&retryWrites=true&w=majority', 
    { useCreateIndex: true, useNewUrlParser: true,server: { auto_reconnect: true }});
  });
  mongoose.connect('mongodb://shivanu31:shivanu31@hackathon-shard-00-00-w8piq.mongodb.net:27017,hackathon-shard-00-01-w8piq.mongodb.net:27017,hackathon-shard-00-02-w8piq.mongodb.net:27017/test?ssl=true&replicaSet=hackathon-shard-0&authSource=admin&retryWrites=true&w=majority', 
    { useCreateIndex: true, useNewUrlParser: true,server: { auto_reconnect: true }});

module.exports = mongoose;