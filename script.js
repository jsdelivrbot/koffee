const remote = require('electron').remote;

var Client = require('instagram-private-api').V1;
var Promise = require('bluebird');
var oldtimestamps;
var session;
var chatid = 0;
var userid = 0;
var cursor = 0;
var moreavaible = false;
var scrollheight = 0;
var updatingflag = false;

remote.getCurrentWindow().toggleDevTools();
function close(){
  remote.BrowserWindow.getFocusedWindow().close();
}
function maximize(){
  remote.BrowserWindow.getFocusedWindow().maximize();
}
function minimize(){
  remote.BrowserWindow.getFocusedWindow().minimize();
}

async function parseFeed(feed){
  const feeds = await feed.all();
  oldtimestamps = feeds.filter(t => t.accounts.length)
    .map(t => ({
      lastactivity : t._params.lastActivityAt,
      id: t.id
    }));
  return feeds.filter(t => t.accounts.length)
    .map(t => ({
      accounts: t.accounts.map(a => a._params),
      items: t.items.map(i => i._params),
      id: t.id,
      lastactivity : new Date(t._params.lastActivityAt)
    }));
};



async function register(user,pass){
let session = await Client.Session.create(new Client.Device('android'), new Client.CookieFileStorage(__dirname + '/user.json'), user, pass)
return session;
}

async function getInbox(){
  const inboxFeed = await new Client.Feed.Inbox(session);
  const feeds = await parseFeed(inboxFeed);
  setInterval(getNewTimestamps,5000)
  return feeds;
}

async function getChat(id,cursor){
  const tFeed = new Client.Feed.ThreadItems(session, id);
  if (cursor !=undefined){
    console.log("cursor aknowledgement")
    tFeed.setCursor(cursor);
  }
  const tFeedIt = await tFeed.get();
  /*console.log("FEED *************************************")
  console.log(tFeedIt)
  console.log("*************************************")*/
  return {f : tFeedIt , cursor : tFeed.getCursor() , moreAvaible : tFeed.moreAvailable} ;
}

async function getNewTimestamps(){
  const inboxFeed = await new Client.Feed.Inbox(session);
  let f = await inboxFeed.all();
  let n = f.filter(t => t.accounts.length)
    .map(t => ({
      lastactivity : t._params.lastActivityAt,
      id: t.id
    }));
    //console.log(oldtimestamps);
    //console.log(n);
  for (t in n){
    if (new Date(oldtimestamps[t].lastactivity) < new Date(n[t].lastactivity)){

    console.log(oldtimestamps[t].id)
    console.log(chatid)

    feeds_ = await parseFeed(inboxFeed);
    domChats(feeds_)

    if (oldtimestamps[t].id == chatid){
      domChat(n[t].id,true);
    }
    break;
    }
  }
}

async function login(){
  $(".window-content").addClass("blur");
  $(".center-form").show();
  $(".button-login").click(async function(){
  console.log("lol")
  let session = await register($("#username").val(),$("#password").val());
  console.log(session);
  instachat();
  })
}

async function domChats(feed){
  startload();
  $("chat-container").empty();
  var chatHtml = $('<li class="list-group-item"><img class="img-circle media-object pull-left" src="/assets/img/avatar.jpg" width="32" height="32"><div class="media-body"><strong>List item title</strong><p>Media</p></div></li>');
  let i = 0;
  let c = [];
  feed.forEach(function(chat){
    //console.log(chat.accounts[0])
    //console.log(i)
    c[i] = chatHtml.clone();
    c[i].attr("userid",chat.accounts[0].id)
    c[i].find("img").attr("src",chat.accounts[0].picture)
    c[i].find("strong").text(chat.accounts[0].username)
    c[i].find("p").text(chat.items[0].text)
    c[i].on("click",function(){domChat(chat.id);$(".active").removeClass("active");$(this).addClass("active");userid = $(this).attr("userid") ; chatid = chat.id; scrollheight = 0;})
    $("chat-container").append(c[i].emojify())
    i++
  })
  endload();
  return true;
}

async function domChat(id,retarded){
  startload();
  if (!retarded){
    $(".chat-pane").empty();
  }

  account = await session.getAccount();
  selfid = account.params.id;
  chat = await getChat(id);

  console.log("CHAT ID : "+chatid);
  console.log("CHAT DATA ********************************************")
  console.log(chat);
  console.log("********************************************")
  //chat.reverse();
  $(".chat-pane").empty();
  d = $("<p>");
  $(".chat-pane").append(d);
  //console.log(chat);
  awi = await renderChat(chat,d)
  endload();


}


async function renderChat(chat,d){
  moreavaible = chat.moreAvaible;
  cursor = chat.cursor;
  chat__ = chat.f.map(i => ({text : i.params.text ,type : i.params.type , id : i.params.accountId , mediashare :i.mediaShare , placeholder : i.placeholder, media : i.params.media}));
  let c = [];
  i = 0;
  chat__.forEach(function(chat_){
    //console.log(chat_)
    c[i] = $("<li>")
    c[i].addClass("message");
    if (selfid == chat_.id){
      c[i].addClass("me")
    }

    switch(chat_.type ){
      case "text":
          c[i].text(chat_.text);
          break;
      case "media":
          src = chat_.media[0].url;
          c[i].append($("<img>").addClass("direct").attr("src",src))
          break;
      case "mediaShare":
          switch(chat_.mediashare._params.mediaType){
            case 1 :
                src = chat_.mediashare._params.images[0].url;
                c[i].append($("<img>").addClass("direct").attr("src",src))
                break;
            case 2 :
                src = chat_.mediashare._params.videos[0].url;
                v = $("<video>").addClass("direct").attr("src",src).attr("controls",true);
                //controls = $("<div>").addClass("video-controls").append($("button").attr("data-media","play-pause"));
                controls = $('<div class="video-controls"><button data-media="play-pause"></button></div>');
                c[i].addClass("video-wrapper paused");
                c[i].append(v);
                c[i].append(controls);

                new InstaVideo(v);
                break;
            default:
                break;
          }
          break;
      case "placeholder":
          c[i].css("color" , "blue")
          c[i].text(chat_.placeholder._params.message);
          break;
      default :
          c[i].css("color" , "red");
          c[i].html("Cannot understand this message \uD83D\uDE05");
          break;
    }
    d.after(c[i].emojify())
    i++
  })
  $(".chat-pane").scrollTop($(".chat-pane").prop("scrollHeight"));
}


var InstaVideo = function (el) {

  	this.$video    = $(el);
  	this.$wrapper  = $(el).parent().addClass('paused');
  	this.$controls = this.$wrapper.find('.video-controls');

  	// remove native controls
  	this.$video.removeAttr('controls');

  	// check if video should autoplay
    if(!!this.$video.attr('autoplay')) {
    		this.$wrapper.removeClass('paused').addClass('playing');
    }

  	// check if video is muted
    if(this.$video.attr('muted') === 'true' || this.$video[0].volume === 0) {
        this.$video[0].muted = true;
        this.$wrapper.addClass('muted');
    }

  	// attach event handlers
  	this.attachEvents();
};

InstaVideo.prototype.attachEvents = function () {

  	var self = this,
        _t; // keep track of timeout for controls

  	// attach handlers to data attributes
    this.$wrapper.on('click', '[data-media]', function () {

        var data = $(this).data('media');

        if(data === 'play-pause') {
            self.playPause();
        }
        if(data === 'mute-unmute') {
            self.muteUnmute();
        }
    });

  	this.$video.on('click', function () {
    		self.playPause();
    });

    this.$video.on('play', function () {
    		self.$wrapper.removeClass('paused').addClass('playing');
    });

    this.$video.on('pause', function () {
    		self.$wrapper.removeClass('playing').addClass('paused');
    });

    this.$video.on('volumechange', function () {
        if($(this)[0].muted) {
        		self.$wrapper.addClass('muted');
        }
        else {
        		self.$wrapper.removeClass('muted');
        }
    });

    this.$wrapper.on('mousemove', function () {

        // show controls
        self.$controls.addClass('video-controls--show');

        // clear original timeout
        clearTimeout(_t);

        // start a new one to hide controls after specified time
        _t = setTimeout(function () {
            self.$controls.removeClass('video-controls--show');
        }, 2250);

    }).on('mouseleave', function () {
        self.$controls.removeClass('video-controls--show');
    });
};

InstaVideo.prototype.playPause = function () {
    if (this.$video[0].paused) {
    		this.$video[0].play();
    } else {
		    this.$video[0].pause();
    }
};

InstaVideo.prototype.muteUnmute = function () {
    if(this.$video[0].muted === false) {
    		this.$video[0].muted = true;
    } else {
		    this.$video[0].muted = false;
    }
};
