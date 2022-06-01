const express = require('express')
const compression = require("compression")
const cors = require('cors')
const errorHandler   = require('errorhandler')
const mongoose = require('mongoose')
const path = require('path')

const https = require('https');
const fs = require('fs');

const dbConfig = require("./config/db")
global.config = require('./config/constant')

process.env.NODE_ENV = 'production'

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(compression())

require('./routes/lottery')(app)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

//app.use(function (req, res, next) {
//    res.header("Access-Control-Allow-Origin", "*")
//    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
//    next()
//})

if (app.get('env') === 'development')
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
else if (app.get('env') === 'production')
    app.use(errorHandler());

app.set('port', config.base.port)

var server
server = require('http').createServer(app)
//server = require('https').createServer(options, app)

const model = require("./models")
model.mongoose.connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {useNewUrlParser: true,useUnifiedTopology: true})
.then(() => {
    console.log("Connected to mongoose has been established successfully.")
})
.catch(err => {
    console.error("Connection error", err)
    process.exit()
})

server.listen(config.base.port, function () {
    console.log("server starting on " + config.base.url + ":" + config.base.port)
});

process.on('SIGINT', function() {
    console.log('Shutting down server..');
    process.exit(0);
});

process.on('uncaughtException', function(err) {
    console.log(err);
});

//module.exports = { app: app, server: server }
