/*
shoplist server app

follows a simple application mounting server

by Pere Albert, Barcelona. <palbcn@yahoo.com>

*/

var express = require('express');
var router = express.Router();

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/shoplist.db');

function sortShopList(list) { 
  function comparer(a,b) { 
    if (a.completed_at&&b.completed_at) return b.completed_at-a.completed_at;  // both completed, most recently completed first
    if (a.completed_at) return 1;  // non-completed first
    if (b.completed_at) return -1;
    return a.added_at-b.added_at;  // both non-completed, most recently added last
  };
  list=list.sort(comparer);
  return list;
}

router.get('/:id', function (req, res, next) {
  db.all('SELECT * FROM shopitems WHERE list_id=?',[req.params.id], function(err, rows) {
    if (err) return next(err);
    res.json( sortShopList(rows) ); // see stackoverflow.com/questions/19041837/difference-between-res-send-and-res-json-in-express-js
  });

});

router.post('/', function (req, res,next) {
  db.run("INSERT INTO shopitems (list_id,name,created_at,comments) VALUES (?,?,?,?)",[1,req.body.name,Date.now(),req.body.notes], function(err) {
    if(err) return next(err);
    db.all('SELECT * FROM shopitems', function(err, rows) {
      res.json( sortShopList(rows) ); 
    });
  })
});

router.delete('/:id',function(req,res,next) {
  db.run("DELETE FROM shopitems WHERE id=?",[req.params.id], function(err) {
    if(err) return next(err);
    db.all('SELECT * FROM shopitems', function(err, rows) {
      res.json( sortShopList(rows) ); 
    });
  });
});

router.put('/:id',function(req,res,next) {
  db.run("UPDATE shopitems SET completed_at=? WHERE id=?",[Date.now(),req.params.id], function(err) {
    if(err) return next(err);
    db.all('SELECT * FROM shopitems', function(err, rows) {
      res.json( sortShopList(rows) ); 
    });
  });
});

// Database initialization  
db.run(`CREATE TABLE IF NOT EXISTS shopitems  
        (  id INTEGER PRIMARY KEY AUTOINCREMENT, 
           list_id INTEGER, 
           name TEXT, 
           created_at TIMESTAMP NOT NULL DEFAULT current_timestamp, 
           created_by INTEGER, 
           completed_at TIMESTAMP, 
           completed_by INTEGER, 
           shop_where TEXT, 
           comments TEXT
        );
`);
db.run(`CREATE TABLE IF NOT EXISTS lists 
        (  id INTEGER PRIMARY KEY AUTOINCREMENT, 
           name TEXT, 
           created_at TIMESTAMP NOT NULL DEFAULT current_timestamp, 
           created_by INTEGER, 
           comments TEXT
        );
`);
db.run(`CREATE TABLE IF NOT EXISTS users 
        (  id INTEGER PRIMARY KEY AUTOINCREMENT, 
           name TEXT, 
           created_at TIMESTAMP NOT NULL DEFAULT current_timestamp, deactivated_at TIMESTAMP, 
           email TEXT, 
           password TEXT, 
           description TEXT, 
           comments TEXT
        );
`);
db.run(`CREATE TABLE IF NOT EXISTS listusers 
        (  list_id INTEGER, 
           user_id INTEGER, 
           assigned_at TIMESTAMP NOT NULL DEFAULT current_timestamp, assigned_by INTEGER, 
           role INTEGER, 
           comments TEXT
        );
`);

if (module.parent) {
  module.exports = router;
  
} else {   // mount it to listen 3000 for unit tests.
  var app = express();
  app.use('/',router);
  var listener=app.listen(process.env.PORT || 3000);
  console.log("Now listening on port %d", listener.address().port)
}
