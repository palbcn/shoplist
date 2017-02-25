#! node
/*
 Server de la Llista de la Compra 
 Lo Pere, Barcelona. palbcn@yahoo.com
*/

var fs=require('fs');
var path=require('path');
var os=require('os');
var express = require('express');
var app = express();
var morgan = require('morgan'); 
var bodyParser = require('body-parser'); 
//var cookieParser = require('cookie-parser');  
//var session = require('express-session'); 


// logger middleware ----------------------------------------------
app.use(morgan('dev'));

// parsing middleware ---------------------------------------------
// parses request cookies, populating req.cookies and req.signedCookies
// secret is used for signing the cookies.
//app.use(cookieParser('HyperSecretCookieSignature'));
// parses json, x-www-form-urlencoded, and multipart/form-data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// static middleware   ---------------------------------------------
app.use(express.static(path.join(__dirname,'client')));


// api router -----------------------------------------------------
var shoplistRouter = require('./shoplist');
app.use('/shoplist',shoplistRouter);

// main, kick off the server --------------------------------------
(function main(){  
  var server = app.listen(process.env.PORT || 60784, function () {
    console.log('Shop List Server is now open for e-business');
    console.log('at localhost:',server.address().port);   
  });
})();

