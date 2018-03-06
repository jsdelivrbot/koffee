instavideo = function(_this){
  let __this = $(_this);
  let a = __this.parent().find('.videoSpritePlayButton')
  __this.after(a)
  __this.parent().hover(function(){
    if ($(_this)[0].paused){
      a.fadeIn(200);
    }

  })
  a.click(function(){
    if ($(_this)[0].paused){
      a.fadeOut(200);
      $(_this)[0].play();
    }
  })
  $(_this).click(function(){
    if (!$(_this)[0].paused){
      a.fadeIn(200);
      $(_this)[0].pause();
    }
  })
}

module.exports = instavideo;
