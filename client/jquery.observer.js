/*
 extend jquery events (.on(),.trigger()) for an anonymous observer pattern
 
 observer uses

     $(".interested").observe("customevent", (event,data) => { } );
   
   
 model triggers events by
 
     $.trigger("customevent",eventdata);
  
  
  Pere Albert, Barcelona <palbcn@yahoo.com>
 
*/


$.fn.observe = function(eventName, callback) {
  return this.each(function(){
    var el = this;
    $(document).on(eventName, function(){
        callback.apply(el, arguments);
    })
  });
}

$.trigger = function(eventName, eventData) {
  $(document).trigger(eventName,eventData);
}