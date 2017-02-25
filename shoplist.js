/*
shoplist server app

follows a simple application mounting server

by Pere Albert, Barcelona. <palbcn@yahoo.com>

*/

var express = require('express');
var router = express.Router();

var testShopList=[{name:'bread',added_at:1480000000000,added_by:'admin'},
            {name:'butter',added_at:1487000000000,added_by:'admin',completed_at:1487970000000,completed_by:'user'}];

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

router.get('/', function (req, res) {
  res.send(testShopList);
});

router.post('/', function (req, res) {
  var item = {
    name: req.body.name,
    where: req.body.where,
    added_by: req.body.user,

    added_at: Date.now(),
    completed_at: null,
    completed_by: null,
    notes: req.body.notes
  };
  testShopList.push(item);
  res.send(sortShopList(testShopList)); 
});

router.delete('/:id',function(req,res) {
  var item=testShopList[req.params.id];
  if (item) {
    item.completed_at=Date.now();
    item.completed_by=req.body.user;
    res.send(sortShopList(testShopList)); 

  } else {
    res.send(404,'item '+req.params.id+' not found');
  }  
});



if (module.parent) {
  module.exports = router;
  
} else {   // mount it to listen 3000 for unit tests.
  var app = express();
  app.use('/',router);
  var listener=app.listen(process.env.PORT || 3000);
  console.log("Now listening on port %d", listener.address().port)
}
