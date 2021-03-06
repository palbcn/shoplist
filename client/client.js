/*

  shoplist client app
  
  Pere Albert, Barcelona <palbcn@yahoo.com>
  

*/


// -----  shoplist client model
  
// create an observable object for global client model  --------------------------------------------------
// make it observable by using setter functions and .trigger() to observers
var clientmodel = (function() {
  // main state (currently three values: #login #alllists #list#)
  var currentstate = null;
  var currentuser = null;   // from login to alllists we need a user
  var currentlist = null;   // from alllists to list# we need a list
  
  return {
    get state() { return currentstate; },
    set state(l) { 
      currentstate=l;
      $.trigger("statechange",currentstate) // triggering the event we can manage controller state 
    },
    get user() { return currentuser; },
    set user(u) { 
      currentuser=u; 
      $.trigger("userchange",currentuser);
      if (!u) this.state="#login";
    },  
    get list() { return currentlist; },
    set list(l) { 
      currentlist=l; 
      $.trigger("listchange",currentlist) 
    }
  }
})();

// view Director -----------------------------------------------------------------------------
// synchronizes the app state with the view displayed.
function viewStateActions(){
  
  $("main form").hide();       
  $("main section").hide();
  $(document).on("statechange",function(ev,loc){
    var stateView="#none";    
    if (loc==="#alllists") stateView="#alllists";
    else if (loc.slice(0,6)==="#list#") stateView="#shoplist";
    else stateView="#login";
    
    console.log("statechange",loc,stateView);
    
    $("body").attr('class', stateView);    // setting the class of body, we can control styling in css
    
    $('main form').hide("slow");  
    $('main section:not('+stateView+')').hide("slow");  // hide everything that isn't
    $('main '+stateView).show("slow");
  });
}

//special case when location is changed by the user, we need to synchronize internally
window.onhashchange = function(){
  if(clientmodel.state!==location.hash) clientmodel.state=location.hash;    
};


// view subscribes to model changes ----------------------------------------------------------------
$(document).observe("userchange",function(event,user){
  if (user) 
    $("#nav-user-name").html('<i class="fa fa-user fa-lg"></i>&nbsp; &nbsp;'+user.name);
  else 
    showLogin;
});

$(document).observe("userchange",function(event,usr){
  if (usr) showAllLists();    
});

$(document).observe("listchange",function(event,lst){
  showShopList(lst.id);
});


// view actions that produce state change -----------------------------------------------------------
function showAllLists() {
  clientmodel.state="#alllists";
  ajaxGetAllLists(renderAllLists);
}

function showShopList(list) { 
  clientmodel.state="#list#"+list;
  ajaxGetShoplist(list,renderShoplist);
}

function showLogin() {
  clientmodel.state="#login";
}

// view refresh without state change         -----------------------------------------------------
function refreshAllLists() {
  console.log('refreshAllLists')
  ajaxGetAllLists(renderAllLists);
}

function refreshShoplist(list) { 
  ajaxGetShoplist(list,renderShoplist);
}

function refreshCurrentShoplist(){
  ajaxGetShoplist(clientmodel.list.id,renderShoplist);
}

// ajax functions -----------------------------------------------------------------------------------

// generic error handler
$(document).ajaxError( function(e, x, settings, exception) {
  var message;
  var statusErrorMap = {
    '400' : "Server understood the request, but request content was invalid.",
    '401' : "Unauthorized access.",
    '403' : "Forbidden resource can't be accessed.",
    '409' : "Request is in conflict with resource state.",
    '500' : "Internal server error.",
    '503' : "Service unavailable."
  };
  if (x.status) {
    message =statusErrorMap[x.status];
    if(!message){
      message="Unknown Error \n.";
    }
  }else if(exception=='parsererror'){
      message="Parsing JSON Request failed.";
  }else if(exception=='timeout'){
      message="Request Time out.";
  }else if(exception=='abort'){
      message="Request was aborted by the server";
  }else {
      message="Unknown Error.";
  }
  topalert("","caution",message+' '+settings.type+' '+settings.url,"OK");

});

function ajaxGetAllLists(cb) {
   $.ajax({
     dataType: "json",
     url: '/shoplist/lists',
     success: cb
   })
}

function ajaxListAdd(name,comments,cb) {
  $.post( '/shoplist/lists', {name,comments}, cb);
}

function ajaxListDelete(list,cb){
  $.ajax({ 
    type: "DELETE",
    url:"/shoplist/lists",
    dataType: "json",
    data: { list_id:list},
    success:cb
  })
}

function ajaxGetShoplist(list,cb) {
   $.ajax({
     dataType: "json",
     url: '/shoplist/items/'+list,
     success: cb
   })
}

function ajaxItemAdd(list,name,where,comments,cb) {
  $.post( '/shoplist/items', {list_id:list,name,where,comments}, cb);
}

function ajaxItemComplete(list,item,cb){
  $.ajax({ 
    type: "PUT",
    url:"/shoplist/items",
    data: { list_id:list, item_id: item},
    dataType: "json",
    success:cb
  })
}

function ajaxItemDelete(list,item,cb){
  $.ajax({ 
    type: "DELETE",
    url:"/shoplist/items",
    dataType: "json",
    data: { list_id:list, item_id: item},
    success:cb
  })
}

function ajaxSignup(usr,email,pw,cb){
  $.ajax({ 
    type: "POST",
    url:"/signup",
    data: { user:usr, email, password:pw },
    dataType: "json",
    success: cb
  })
}

function ajaxLogin(usr,email,pw,cb){
  $.ajax({ 
    type: "POST",
    url:"/login",
    data: { user:usr, email:email, password:pw },
    dataType: "json",
    success: cb
  })
}

function ajaxLogout(cb){
  $.ajax({ 
    type: "GET",
    url:"/logout",
    success: cb
  })
}

function ajaxGetLoggedin(cb) {
   $.ajax({
     dataType: "json",
     url: '/loggedin',
     error: err=>cb(null),
     success: cb
   })
}


// view render functions ------------------------------------------
function renderItem(item) {
  console.log(item);
  $item = $('<div class="item" id="item-'+item.id+'"/>');
  $item.append($('<p class="index">')
    .text(item.id));
  $item.append($('<p class="timestamp added">')
    .text(new Date(item.created_at).toLocaleString('en-GB').slice(0,-3)));          
  $item.append($('<p class="element">')
    .text(item.name));
  $item.append($('<p class="comments">')
    .text(item.comments));  

  var $iconcomplete=$('<i title="Check as completed" class="fa fa-3x icon-complete"/>').hide() 
  $item.append($iconcomplete);
  $iconcomplete.click(function(){ajaxItemComplete(clientmodel.list.id,item.id,refreshCurrentShoplist)});
  $item.hover(()=>$iconcomplete.show(),()=>$iconcomplete.hide());
  
  var $iconremove=$('<i title="Remove from list" class="fa fa-3x icon-remove"/>').hide() 
  $item.append($iconremove);
  $iconremove.click(function(){ajaxItemDelete(clientmodel.list.id,item.id,refreshCurrentShoplist)});
  $item.hover(()=>$iconremove.show(),()=>$iconremove.hide());
  
  if (item.completed_at) {
    $item.addClass("completed");
    $item.append($('<p class="timestamp completed">')
      .text(new Date(item.completed_at).toLocaleString('en-GB').slice(0,-3)));
  }
  return $item;
}

function renderShoplist(list) {
  $("#shoplist").show("slow");
  $("#shoplist-name").text("Shop list "+clientmodel.list.name+" of "+clientmodel.user.name);
  $("#shoplist-items").empty();
  list.map( (item) => { 
    $("#shoplist-items").append(renderItem(item)) 
  });
}

//-------------------------------------------------------------------------------------------------
function renderListdesc(listdesc) {
  console.log(listdesc);
  var $listdesc = $('<div class="listdesc" id="list-'+listdesc.id+'"/>');
  
  var $p = $('<p>');
  $p.append($('<span class="index">')
    .text(listdesc.id));
  $p.append($('<span class="timestamp created">')
    .text((new Date(listdesc.created_at)).toLocaleString('en-GB').slice(0,-3)));
  $listdesc.append($p);

  $listdesc.append($('<p class="name">')
    .text(listdesc.name));
  $listdesc.append($('<p class="comments">')
    .text(listdesc.comments)); 

  var $iconselect=$('<i title="Select this one" class="fa fa-3x icon-select"/>').hide() 
  $listdesc.append($iconselect);
  $iconselect.click(function(){ clientmodel.list=listdesc });
  $listdesc.hover(()=>$iconselect.show(),()=>$iconselect.hide());
  
  var $iconremove=$('<i title="Remove list" class="fa fa-3x icon-remove"/>').hide() 
  $listdesc.append($iconremove);
  $iconremove.click(()=>ajaxListDelete(listdesc.id,refreshAllLists));
  $listdesc.hover(()=>$iconremove.show(),()=>$iconremove.hide());

  return $listdesc;
}

function renderAllLists(list) {
  $("#alllists").show("slow");
  $("#alllists-name").text("Shop lists of "+clientmodel.user.name);
  $("#alllists-lists").empty();
  list.map( (desc) => {
    $("#alllists-lists").append(renderListdesc(desc));
  });
}


// user actions  ----------------------------------------------------------------------------------
function shopListActions() {
  $("#shoplist-cancel").on('click',()=>{
    clientmodel.state="#alllists";  
  });
  $("#shoplist-add-item").on('click',()=>{
     $("#item-entry").show("slow");
  });
  $("#item-add-item").on('click',()=>{
    ajaxItemAdd(clientmodel.list.id,$("#item-name").val(),$("#item-where").val(),$("#item-notes").val(),refreshCurrentShoplist);
    $("#item-entry").hide("slow");
    return false;
  });
  $("#item-cancel").on('click',()=>{
    $("#item-entry").hide("slow");
    return false;
  });
   
  $("#alllists-add-list").on('click',()=>{
     $("#list-entry").show("slow");
     return false;
  });
  $("#list-add-list").on('click',()=>{
    ajaxListAdd($("#list-name").val(),$("#list-comments").val(),refreshAllLists);
    return false;
  });
  $("#list-cancel").on('click',()=>{
    $("#list-entry").hide("slow");
    return false;
  });

  
}

function userManagementActions() {
  $("#nav-user-name").on('click',()=> {
    $("#user-info-form").show("slow");
  });
  $("#nav-logout").on('click',()=> {
    ajaxLogout(function(){ 
      clientmodel.user=null; 
    });
  });  
  $("#nav-signup, #login-signup").on('click',()=> {
    $("#user-signup-form input").val('');
    $("#user-signup-password, #user-signup-password2").removeClass('error');  
    $("#user-signup-form").show("slow");
  });
  $("#nav-login, #login-login").on('click',()=> {
    $("#user-login-form input").val('');
    $("#user-login-form").show("slow");
  });
  
  $("#user-signup-submit").on('click',()=>{
    var pw1=$("#user-signup-password").val();
    var pw2=$("#user-signup-password2").val();
    if (pw1===pw2) {
      ajaxSignup($("#user-signup-name").val(),$("#user-signup-email").val(),pw1,function(r) {
        clientmodel.user=r;
      });
      $("#user-signup-form").hide("slow");
    } else {   
      $("#user-signup-password, #user-signup-password2").addClass('error');    
    }
    return false;
  }); 
  $("#user-signup-cancel").on('click',()=>{
    $("#user-signup-form").hide("slow");
    return false;
  });

  
  $("#user-login-submit").on('click',()=>{
    var name=$("#user-login-name").val();
    var email=$("#user-login-email").val();
    var password=$("#user-login-password").val();
    ajaxLogin(name,email,password,function(r) {
      clientmodel.user=r;
    });
    $("#user-login-form").hide("slow");
    return false;
  });
  $("#user-login-cancel").on('click',()=>{
    $("#user-login-form").hide("slow");
    return false;
  });

}

 
// kickoff  --------------------------------------------------------------------------------------
$(function(){
  viewStateActions();
  userManagementActions();
  shopListActions();
  ajaxGetLoggedin(function(usr) {
    clientmodel.user=usr; 
  });
  
  if ($.cookie("accept-cookies")!=1) 
    topalert("cookies","warning",
      'This site might be using <a href="http://en.wikipedia.org/wiki/HTTP_cookie">cookies</a>, either own or third-party. You accept them, right?',
      'OK, understood.',function(){ 
        $.cookie("accept-cookies", 1);
    });
  
});