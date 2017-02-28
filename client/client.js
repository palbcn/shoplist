/*

  shoplist client app
  
  Pere Albert, Barcelona <palbcn@yahoo.com>
  

*/

// use jquery events (.on(),.trigger()) for an anonymous observer pattern ------
// usage is $(".interested").observe("customevent",function(event,data){});
// model triggers events $(document).trigger("customevent",eventdata);
$.fn.observe = function(eventName, callback) {
  return this.each(function(){
    var el = this;
    $(document).on(eventName, function(){
        callback.apply(el, arguments);
    })
  });
}

// create an observable object for global client model  -----------------------
// make it observable by using setter functions and .trigger() to observers
var clientmodel = {
  // main state (currently three values: #login #lists #list##)
  currentstate: null,
  get state() { return this.currentstate; },
  set state(l) { 
    this.currentstate=l; 
    location.hash=l; 
    $(document).trigger("statechange",this.currentstate) 
  },
  
  currentuser: null,
  get user() { return this.currentuser; },
  set user(u) { 
    this.currentuser=u; 
    $(document).trigger("userchange",this.currentuser) 
  },  
  
  currentlist: null,
  get list() { return this.currentlist; },
  set list(l) { 
    this.currentlist=l; 
    $(document).trigger("listchange",this.currentlist) 
  }
}

//special case when location is changed by the user, we need to synchronize internally
window.onhashchange = function(){
  if(clientmodel.currentstate!==location.hash) clientmodel.currentstate=location.hash;    
};

// view elements subscribe to model changes ------------------------------------
$("#nav-user-name").observe("userchange",function(event,user){
  if (user) {
    $(this).html('<i class="fa fa-user fa-lg"></i>&nbsp; &nbsp;'+user.name);
    $(this).show();
  } else {
    $(this).hide();
  }
});

$("#nav-logout").observe("userchange",function(event,usr){
  if (usr) $(this).show();
  else $(this).hide();
});

$("#nav-login, #nav-signup").observe("userchange",function(event,usr){
  if (usr) $(this).hide();
  else $(this).show();
});

$("#shoplists").observe("userchange",function(event,usr){
  if (!usr) $(this).hide();
  else showShopLists();    
});

$("#shoplists").observe("userchange",function(event,usr){
  if (!usr) $(this).hide();
  else showShopLists();    
});

$("#shoplist").observe("listchange",function(event,lst){
  showShopList(lst.id);
});

$("#shoplists").observe("statechange",function(event,loc){
  if (loc==="#lists") $(this).show("slow"); 
  else $(this).hide("slow");
});

$("#shoplist").observe("statechange",function(event,loc){
  if (!loc.slice(0,6)==="#list#") $(this).hide("slow");
});


// ajax handlers -------------------------------------------------
function say(s){
  $("#debug").append($("<p/>").text(s));
}
function hhmmss(ts){
  return new Date(ts).toTimeString().split(' ')[0];
}
// Attach a function to be executed before an Ajax request is sent. // https://api.jquery.com/category/ajax/global-ajax-event-handlers/
$(document).ajaxSend(function(e) {
  //if (userloggedin) { }
});

$(document).ajaxError(function(event, jqXHR, ajaxSettings, thrownError ) {  say("ajaxError:"+JSON.stringify(jqXHR));
  //if error 401 user is not logged in
  if (jqXHR.status===401) ;
});

// ajax functions -------------------------------------------------
function getShoplists(cb) {
   $.ajax({
     dataType: "json",
     url: '/shoplist/lists',
     success: cb
   })
}

function listAdd(name,comments,cb) {
  $.post( '/shoplist/lists', {name,comments}, cb);
}

function getShoplist(list,cb) {
   $.ajax({
     dataType: "json",
     url: '/shoplist/list/'+list,
     success: cb
   })
}

function itemAdd(list,name,where,comments,cb) {
  $.post( '/shoplist/list', {list_id:list,name,where,comments}, cb);
}

function itemComplete(list,item,cb){
  $.ajax({ 
    type: "PUT",
    url:"/shoplist/list",
    data: { list_id:list, item_id: item},
    dataType: "json",
    success:cb
  })
}

function itemDelete(list,item,cb){
  $.ajax({ 
    type: "DELETE",
    url:"/shoplist/list/",
    dataType: "json",
    data: { list_id:list, item_id: item},
    success:cb
  })
}

function signup(usr,email,pw,cb){
  $.ajax({ 
    type: "POST",
    url:"/signup",
    data: { user:usr, email, password:pw },
    dataType: "json",
    success: cb
  })
}

function login(usr,email,pw,cb){
  $.ajax({ 
    type: "POST",
    url:"/login",
    data: { user:usr, email:email, password:pw },
    dataType: "json",
    success: cb
  })
}

function logout(cb){
  $.ajax({ 
    type: "GET",
    url:"/logout",
    success: cb
  })
}

function getLoggedin(cb) {
   $.ajax({
     dataType: "json",
     url: '/loggedin',
     success: cb
   })
}


// view render functions ------------------------------------------
function renderItem(item) {
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
  $iconcomplete.click(function(){itemComplete(clientmodel.list.id,item.id)},showShopList);
  $item.hover(()=>$iconcomplete.show(),()=>$iconcomplete.hide());
  
  var $iconremove=$('<i title="Remove from list" class="fa fa-3x icon-remove"/>').hide() 
  $item.append($iconremove);
  $iconremove.click(function(){itemDelete(clientmodel.list.id,item.id,showShopList)});
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

//-----------------------------------------------------------------
function renderListdesc(listdesc) {
  $listdesc = $('<div class="listdesc" id="list-'+listdesc.id+'"/>');
  $listdesc.append($('<p class="index">')
    .text(listdesc.id));
  $listdesc.append($('<p class="timestamp created">')
    .text(new Date(listdesc.created_at).toLocaleString('en-GB').slice(0,-3)));          
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
  $iconremove.click(function(){  });
  $listdesc.hover(()=>$iconremove.show(),()=>$iconremove.hide());

  return $listdesc;
}

function renderShoplists(list) {
  $("#shoplists").show("slow");
  $("#shoplists-name").text("Shop lists of "+clientmodel.user.name);
  $("#shoplists-lists").empty();
  list.map( (desc) => {
    $("#shoplists-lists").append(renderListdesc(desc));
  });
}


// wiew actions  ------------------------------------------
function showShopLists() {
  clientmodel.currentstate="#lists";
  getShoplists(renderShoplists);
}

function showShopList(list) { 
  clientmodel.currentstate="#list#"+list;
  getShoplist(list,renderShoplist);
}


// user actions  ------------------------------------------
function shopListActions() {
  $("#shoplist-add-item").on('click',()=>{
     $("#item-entry").show("slow");
  });
  $("#item-add-item").on('click',()=>{
    itemAdd(clientmodel.list.id,$("#item-name").val(),$("#item-where").val(),$("#item-notes").val(),showShopList);
    $("#item-entry").hide("slow");
  });
  $("#item-cancel").on('click',()=>{
    $("#item-entry").hide("slow");
  });
  $("#item-entry input").keyup(function(event){
    if(event.keyCode===13){
        $("#item-add-item").click();
    }
  });
  
  
  $("#shoplists-add-list").on('click',()=>{
     $("#list-entry").show("slow");
  });
  $("#list-add-list").on('click',()=>{
    listAdd($("#list-name").val(),$("#list-comments").val());
    $("#list-entry").hide("slow");
  });
  $("#list-cancel").on('click',()=>{
    $("#list-entry").hide("slow");
  });
  $("#list-entry input").keyup(function(event){
    if(event.keyCode===13){
        $("#list-add-list").click();
    }
  });
  
}

function userManagementActions() {
  $("#nav-user-name").on('click',()=> {
    $("#user-info-form").show("slow");
  });
  $("#nav-logout").on('click',()=> {
    logout(function(){ clientmodel.user=null; });
  });  
  $("#nav-signup").on('click',()=> {
    $("#user-signup-form input").val('');
    $("#user-signup-password, #user-signup-password2").removeClass('error');  
    $("#user-signup-form").show("slow");
  });
  $("#nav-login").on('click',()=> {
    $("#user-login-form input").val('');
    $("#user-login-form").show("slow");
  });
  
  $("#user-signup-submit").on('click',()=>{
    var pw1=$("#user-signup-password").val();
    var pw2=$("#user-signup-password2").val();
    if (pw1===pw2) {
      signup($("#user-signup-name").val(),$("#user-signup-email").val(),pw1,function(r) {
        clientmodel.user=r;
      });
      $("#user-signup-form").hide("slow");
    } else {   
      $("#user-signup-password, #user-signup-password2").addClass('error');    
    }
  }); 
  $("#user-signup-cancel").on('click',()=>{
    $("#user-signup-form").hide("slow");
  });
  $("#user-signup-form input").keyup(function(event){
    if(event.keyCode===13){
        $("#user-signup-submit").click();
    }
  });
  
  $("#user-login-submit").on('click',()=>{
    var name=$("#user-login-name").val();
    var email=$("#user-login-email").val();
    var password=$("#user-login-password").val();
    login(name,email,password,function(r) {
      clientmodel.user=r;
    });
    $("#user-login-form").hide("slow");
  });
  $("#user-login-cancel").on('click',()=>{
    $("#user-login-form").hide("slow");
  });
  $("#user-login-form input").keyup(function(event){
    if(event.keyCode===13){
        $("#user-login-submit").click();
    }
  });
}
 
// kickoff  ------------------------------------------
$(function(){
  userManagementActions();
  shopListActions();
  getLoggedin(function(usr) { 
    clientmodel.user=usr; 
  });
});