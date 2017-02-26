
function getShoplist(cb) {
   $.ajax({
     dataType: "json",
     url: '/shoplist/1',
     success: cb
   })
}

function itemComplete(id){
  $.ajax({ 
    type: "PUT",
    url:"/shoplist/"+id.slice(5),
    dataType: "json",
    success:renderShoplist
  })
}

function itemDelete(id){
  $.ajax({ 
    type: "DELETE",
    url:"/shoplist/"+id.slice(5),
    dataType: "json",
    success:renderShoplist
  })
}

function renderItem(item) {
  $item = $('<div class="item" id="item-'+item.id+'"/>');
  $item.append($('<p class="index">')
    .text(item.id));
  $item.append($('<p class="timestamp added">')
    .text(new Date(item.created_at).toLocaleString('en-GB').slice(0,-3)));          
  $item.append($('<p class="element">')
    .text(item.name));

  var $iconcomplete=$('<i title="complete" class="fa icon-complete"/>').hide() 
  $item.append($iconcomplete);
  $iconcomplete.click(function(){itemComplete($(this).parent()[0].id)});
  $item.hover(()=>$iconcomplete.show(),()=>$iconcomplete.hide());
  
  var $iconremove=$('<i title="remove" class="fa icon-remove"/>').hide() 
  $item.append($iconremove);
  $iconremove.click(function(){itemDelete($(this).parent()[0].id)});
  $item.hover(()=>$iconremove.show(),()=>$iconremove.hide());
  
  if (item.completed_at) {
    $item.addClass("completed");
    $item.append($('<p class="timestamp completed">')
    .text(new Date(item.completed_at).toLocaleString('en-GB').slice(0,-3)));          
  }
  return $item;
}

function renderShoplist (list) {
  $("#shop-list").empty();
  list.map( (item) => { 
    $("#shop-list").append(renderItem(item)) 
  });
}
 
$(function(){
  getShoplist(renderShoplist);
 
  $("#item-add-item").on('click',()=>{
    var item={ 
      name: $("#item-name").val(),
      where: $("#item-where").val(),
      notes: $("#item-notes").val() };
    $.post( '/shoplist', item, renderShoplist);
    $("#item-entry").hide("slow");
  });
  $("#item-cancel").on('click',()=>{
    $("#item-entry").hide("slow");
  });
  
  $("#list-add-item").on('click',()=>{
     $("#item-entry").show("slow");
  });
  
  $("#user-name").on('click',()=> (user)?userInfo():login());
});