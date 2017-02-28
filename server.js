#! node
/*
 Server de la Llista de la Compra 
 Lo Pere, Barcelona. palbcn@yahoo.com
*/

var fs=require('fs');
var path=require('path');
var os=require('os');
var util=require('util');
var express = require('express');
var app = express();
var morgan = require('morgan'); 
var bodyParser = require('body-parser'); 
var session = require('express-session'); 
var passwords = require('./passwords');

// DB middleware ----------------------------------------------
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/shoplist.db');

// logger middleware ----------------------------------------------
app.use(morgan('dev'));

// static middleware   ---------------------------------------------
app.use(express.static(path.join(__dirname,'client')));

// parsing middleware ---------------------------------------------
// cookieparser is not longer needed for express sessions
// parses json, x-www-form-urlencoded, and multipart/form-data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// session middleware ---------------------------------------------
app.use(session({ 
  secret: 'HyperSecretShoplistSessionSignature',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure:false   //// just during development... then swith to true
  } 
 }));
 
 
// test -----------------------------------------------------
app.get('/echo', function (req, res, next) {
  res.json( { query:req.query, session:req.session, body:req.body });
  });

//-----------------------------------------------------
app.post('/signup', function (req, res, next) {
  passwords.hash(req.body.password, function (err,pw){
    if (err) return next(err);
    db.run("INSERT INTO users (name, email, password) VALUES (?,?,?)",
              [req.body.user,req.body.email,pw], function(err){
      if (err) return next(err);
      db.get("SELECT id,name,email FROM users WHERE name=?",[req.body.user],function(err,row){
        if (err) return next(err);
        req.session.user=row;
        res.json(row);
      });  
    });
  });
});

app.post('/login', function (req, res, next) {
  db.get("SELECT id,name,email,password FROM users WHERE name=?",[req.body.user],function (err,row){
    if (err) return next(err);
    if (!row) return res.sendStatus(401);
    passwords.check(req.body.password,row.password,function(err){
      if (err) return res.sendStatus(401);
      delete row.password;
      req.session.user=row;
      res.json(row);
    });
  });
});

// authorization middleware to be used for secured routes  -------------------
var protect = function(req, res, next){
  if (!req.session.user) 
    res.sendStatus(401);
  else
    next();
};

// simply returning the current user is protected too ------------------------
app.get('/loggedin', protect, function (req, res, next) {
  res.json(req.session.user);
});

app.get('/logout', protect, function (req, res, next) {
  delete req.session.user;
  res.sendStatus(200);
});
 
// api router -----------------------------------------------------
var shoplistRouter = require('./shoplist');
app.use('/shoplist',protect,shoplistRouter(db));

// main, kick off the server --------------------------------------
(function main(){  
  var server = app.listen(process.env.PORT || 60784, function () {
    console.log('Shop List Server is now open for e-business');
    console.log('at localhost:',server.address().port);   
  });
})();

