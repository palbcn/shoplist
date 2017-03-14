/*
shoplist server app

follows a simple application mounting server

by Pere Albert, Barcelona. <palbcn@yahoo.com>

*/

var express = require('express');
var router = express.Router();
var db=null;

/******************************************************************************/
router.get('/lists', function (req,res,next) {
  db.all('SELECT l.id, l.name, l.created_at, l.comments FROM lists l, listusers u WHERE u.user_id=? AND l.id=u.list_id',[req.session.user.id],function(err, rows) {
    if (err) return next(err);
    res.json( rows );
  });
});

router.post('/lists', function (req,res,next) {
  db.run('BEGIN TRANSACTION',function(err) {
    if(err) return next(err);
    db.run('INSERT INTO lists(name,comments,created_by) VALUES (?,?,?)',
           [req.body.name,req.body.comments,req.session.user.id], function(err) {
      if(err) {
        db.run('ROLLBACK');  
        return next(err);
      }
      db.run('INSERT INTO listusers (list_id,user_id,assigned_by) VALUES(?,?,?)',
             [this.lastID,req.session.user.id,req.session.user.id], function(err) {
        if(err) {
          db.run('ROLLBACK');  
          return next(err);
        }
        db.run('COMMIT');
        res.sendStatus(200);        
      })
    });      
  });
});

router.delete('/lists', function (req,res,next) {
  checklistuser(req.body.list_id,req.session.user.id,function(err){
    if (err) return res.sendStatus(401);
    db.run('BEGIN TRANSACTION',function(err) {
      if(err) return next(err);
      db.get('SELECT COUNT(*) num FROM shopitems WHERE list_id=?',[req.body.list_id], function(err,row) {
        if(err) return next(err);
        if (row.num!=0) {
          db.run('ROLLBACK');
          return res.status(409).json({error:'list is not empty, contains '+row.num+' items.'});
        }
        db.run('DELETE FROM listusers WHERE list_id=?',[req.body.list_id], function(err) {
          if(err) {
            db.run('ROLLBACK');  
            return next(err);
          }
          db.run('DELETE FROM lists WHERE id=?',[req.body.list_id], function(err) {
            if(err) {
              db.run('ROLLBACK');  
              return next(err);
            }
            db.run('COMMIT');
            res.sendStatus(200);        
          });
        });      
      });
    });
  });
});

/******************************************************************************/
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

function sendListPrim(listid,res) {
  db.all('SELECT * FROM shopitems WHERE list_id=?',[listid], function(err, rows) {
    res.json( sortShopList(rows) ); 
  });
}

function checklistuser(listid,userid,cb) {
  db.get('SELECT * FROM listusers WHERE user_id=? AND list_id=?',[userid,listid],function(err, row) {
    if (err||!row) return cb(401);
    cb(null);
  });
}

router.get('/items/:id', function (req, res, next) {
  checklistuser(req.params.id,req.session.user.id,function(err){
    if (err) return res.sendStatus(401);
    sendListPrim(req.params.id,res);
  });
});
  
router.post('/items', function (req, res,next) {
  checklistuser(req.body.list_id,req.session.user.id,function(err){
    if (err) return res.sendStatus(401);
    db.run('INSERT INTO shopitems (list_id,name,comments) VALUES (?,?,?)',
         [req.body.list_id,req.body.name,req.body.comments], function(err) {
      if(err) return next(err);     
      sendListPrim(req.body.list_id,res);
    });
  })
});

router.delete('/items',function(req,res,next) {
  checklistuser(req.body.list_id,req.session.user.id,function(err){
    if (err) return res.sendStatus(401);
    db.run("DELETE FROM shopitems WHERE list_id=? AND id=?",[req.body.list_id,req.body.item_id], function(err) {
      if(err) return next(err);
      sendListPrim(req.body.list_id,res);
    });
  });
});

router.put('/items',function(req,res,next) {
  checklistuser(req.body.list_id,req.session.user.id,function(err){
    if (err) return res.sendStatus(401);
    db.run(`UPDATE shopitems 
              SET completed_at=CASE 
                WHEN completed_at IS NULL 
                  THEN DATETIME('now') 
                  ELSE NULL 
                END
              WHERE list_id=? AND id=?`,
      [req.body.list_id,req.body.item_id], function(err) {
        if(err) return next(err);
        sendListPrim(req.body.list_id,res);
      });
  });
});

/******************************************************************************/
// Database initialization  
function initdb(db) {
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
           name TEXT UNIQUE, 
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
  return db;
}

function getrouter(database) {
  db = initdb(database);
  return router;
}

/******************************************************************************/
if (module.parent) {
  module.exports = getrouter;
  
} else {   // mount it to listen 3000 for unit tests.
  var app = express();
  app.use('/',router);
  var listener=app.listen(process.env.PORT || 3000);
  console.log("Now listening on port %d", listener.address().port)
}