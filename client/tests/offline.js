var llistadelacompra={};

llistadelacompra.webdb={};

llistadelacompra.webdb.db=null;

llistadelacompra.webdb.open = function(){
  llistadelacompra.webdb.db=openDataBase("Compra","1","Compra manager",5*1024*1024);
}

llistadelacompra.webdb.onError = function(tx,e){
  alert("Error: "+e.message);
}

llistadelacompra.webdb.onSuccess = function(tx,r){
  llistadelacompra.webdb.getAllCompraItems(renderCompraItems);
}

llistadelacompra.webdb.createTable = function() {
  llistadelacompra.webdb.db.transaction(function(tx){
    tx.executeSql(`CREATE TABLE IF NOT EXISTS compra (
        id INTEGER PRIMARY KEY ASC, item TEXT, 
        addedon DATETIME, addedby INTEGER,
        completedon DATETIME, completedby INTEGER, notes TEXT)`,[]);
  });      
}

llistadelacompra.webdb.addCompra = function(item,who) {
  llistadelacompra.webdb.db.transaction(function(tx){
    var addeon = new Date();
    tx.executeSql("INSERT INTO compra (item, addenon, addedby) VALUES (?,?,?)",
      [item,addedon,who],llistadelacompra.webdb.onSuccess,llistadelacompra.webdb.onError);
  });
}

llistadelacompra.webdb.getAllCompraItems = function(cb){
  llistadelacompra.webdb.db.transaction(function(tx){
    tx.executeSql("SELECT * FROM compra",
    [],cb,llistadelacompra.webdb.onError);
  });
}

function renderCompraItems(tx,rs) {
  var r="";
  for (var i=0; i<rs.rows.length; i++) {
    r += renderCompraItem(rs.rows.item(i));
  }
  $('#compra').html(r);
}

function renderCompraItem(row) {
  return `<li> ${row.item} 
    [<a href="javascript:void(0); 
        onclick="llistadelacompra.webdb.deleteItem(${row.id});">delete</a>]
   </li>`
}  

llistadelacompra.webdb.deleteItem = function(id) {
  llistadelacompra.webdb.db.transaction(function(tx){
    tx.executeSql("DELETE FROM compra WHERE id=?",[id],
      llistadelacompra.webdb.onSuccess,llistadelecompra.webdb.onError);
  });
}

$(function(){
  llistadelacompra.webdb.open();
  llistadelacompra.webdb.createTable();
  llistadelacompra.webdb.getAllCompraItems(renderCompraItems);
  
  $("#additem").on('click',function(){
    llistadelacompra.webdb.addCompra($("item").val());
  });
});
