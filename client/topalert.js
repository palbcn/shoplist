function topalert(anid,moreclasses,alertmsg,okmsg,cb) {
    var $topalert = $('<div>').addClass("topalert");
    if (anid) $topalert.attr("id",anid);
    if (moreclasses) $topalert.addClass(moreclasses);
    
    var $msg1=$('<span>').addClass("msg1").html(alertmsg).appendTo($topalert);
    $msg1.show();
    
    var $msg2=$('<span>').addClass("msg2").html(okmsg).appendTo($topalert);
    $msg2.hide();

    //var $close=$('<span>').addClass("close").append("X").appendTo($topalert);
    $topalert.on('click',function(){
      $msg1.hide();
      $msg2.show();
      $topalert.delay(1000).fadeOut();
      if (cb) cb();
    });
    
    $('body').prepend($topalert);
    $topalert.fadeIn();
}
  