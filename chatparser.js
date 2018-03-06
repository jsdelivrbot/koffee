Chatparser = function(chat){
  _chat_ = chat.f.map(function(t) {

      a = {
        videocontrols :false,
        type: t._params.type,
        text: t._params.text,
        me: false,
        mediashare: t.mediaShare,
        placeholder: t.placeholder,
        media: t._params.media,
        reelShare: t._params.reelShare,
        timestamp : t._params.created,
        link : t.link,
        unsent : false
      }
      //console.log(t._params.accountId)
      if (selfid == t._params.accountId) {
        a.me = true;
      }
      return a
    })
    return _chat_
}

module.exports = Chatparser;
