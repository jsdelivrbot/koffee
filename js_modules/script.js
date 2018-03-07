window.Vue = require('./js_modules/vue.js');
var vueripple = require("./vue-ripple-directive")
Vue.directive("ripple",vueripple);
/***************************************
TODO linkS

***************************************/
var oldtimestamps = []
var session;
var updatingFlag = false;
var moreAvaible = false;
var scrollHeight = 0;
var app = new Vue({
  el: '#app',
  data: {
    chattitle : "",
    videocontrols : false,
    moreAvaible: "",
    lightbox : false,
    lightboxsrc : "",
    selfid: "",
    chatid: "",
    userid: "",
    cursor: "",
    message: "",
    loading: false,
    chats: [],
    chat: [],
    filter: ""
  },
  computed: {
    messageIsEmpty: function() {
      return this.message != ""
    },
    filtered: function() {
      if (this.filter == "") {
        return true
      } else {
        return false
      }

    }
  },
  methods: {
    openChat: async function(chat) {
      this.chattitle = chat.title;
      this.chat = [];
      this.chats.forEach(function(v,index){
        v.selected = false;
      })
      chat.selected = true;
      this.loading = true;
      updatingFlag = true;
      this.chatid = chat.id;
      this.userid = chat.userid;
      const self = this;
      selfid = await session.getAccount();
      selfid = selfid.id;
      chat = await getChat(chat.id);
      console.log("CHAT ID : " + chat.id);
      console.log(chat)
      //chat.reverse();
      self.cursor = chat.cursor;
      moreAvaible = chat.moreAvaible;
      c = chatparser(chat).reverse();
      console.log("CHAT DATA ********************************************")
      console.log(c);
      console.log("********************************************")
      this.chat = c
      this.loading = false;
      Vue.nextTick(function () {
        $(".chat-pane").scrollTop(document.getElementsByClassName("chat-pane")[0].scrollHeight);
        updatingFlag = false;
      })
    },
    loadMoreChat: async function() {
      console.log("load more chats")
      this.loading = true;
      updatingFlag = true;
      const self = this;
      selfid = await session.getAccount();
      selfid = selfid.id;
      chat = await getChat(this.chatid, this.cursor);
      console.log("CHAT ID : " + chat.id);
      console.log(chat)
      //chat.reverse();
      self.cursor = chat.cursor;
      moreAvaible = chat.moreAvaible;
      c = chatparser(chat)
      console.log("CHAT DATA ********************************************")
      console.log(c);
      for (let i in c) {
        app.chat.unshift(c[i]);
      }
      //this.chat = c.reverse();
      //$(".chat-pane").scrollTop(document.getElementsByClassName("chat-pane")[0].scrollHeight);
      this.loading = false;
      scrollHeight = document.getElementsByClassName("chat-pane")[0].scrollHeight;
      Vue.nextTick(function () {
        updatingFlag = false;
        $(".chat-pane").scrollTop(document.getElementsByClassName("chat-pane")[0].scrollHeight - scrollHeight);
      })

    },
    sendMessage: async function() {
      if (this.messageIsEmpty){
        this.loading = true;
        thread = await Client.Thread.configureText(session, this.userid, this.message);
        console.log(thread)
        this.loading = false;
        this.chat.push({
          id : Date.now(),
          me: true,
          media: undefined,
          mediashare: undefined,
          placeholder: undefined,
          reelShare: undefined,
          text: this.message,
          type: "text",
          unsent : true
        })
        this.message = "";
        Vue.nextTick(function () {
          $(".chat-pane").scrollTop(document.getElementsByClassName("chat-pane")[0].scrollHeight);
          updatingFlag = false;
        })
      }

    },
    openLink : function(link){
      shell.openExternal(link)
    },
    openLightbox : function(src){
      this.lightbox = true;
      this.lightboxsrc = src;
    },
    closeLightbox : function(){
      this.lightbox = false;
    },
    downloadMedia : function(url){
      require("electron").remote.require("electron-download-manager").download({
              url: url
          }, function(error, url){
              if(error){
                  alert("ERROR: " + url);
                  return;
              }

              console.log("downloaded")

          });
    },
    emojiparse : function(message){
      return $("<p>").text(message).emojify().html();
    }
  }
})
var {shell}  = require("electron")
var Client = require('instagram-private-api').V1;
var Promise = require('bluebird');
var chatparser = require('./js_modules/chatparser.js')

require("./js_modules/array-diff.js")
window.$ = window.jQuery = require('jquery');
require('./js_modules/emoji.js')
require("./electron-titlebar");
var instavideo = require('./js_modules/instavideo.js')
instachat();
console.log(app.loading);
async function instachat() {
  //$("window-content").removeClass("blur");
  //$("center-form").hide();
  app.loading = true;
  session = await register(require("./config.json").user,require("./config.json").password); // leggere la password dal token
  feed = await getInbox();
  console.log("FEED************************************");
  feed = feed.map(function(t){
    let a = {
        selected : false,
        title: t.accounts[0].username,
        img: t.accounts[0].profilePicUrl,
        firstmsg: t.items[0].text,
        itemtype: t.items[0].itemType,
        id: t.id,
        userid: t.accounts[0].id}
    switch (a.itemtype){
      case "text" :
        break;
      case "mediaShare":
        a.firstmsg = "Media Share";
        break;
      default: a.firstmsg = "Media";
        break;
    }
    return a;
  })
  console.log(feed); //$("center-form").hide();
  app.loading = true;
  console.log("****************************************")
  app.chats = feed;
  app.loading = false;
  setInterval(getNewTimestamps, 1000)
}

$(".chat-pane").scroll(async function(d) {
  off = d.target.scrollTop;
  if ((moreAvaible == true) && (off < 500) && (updatingFlag == false)) {
    app.loadMoreChat();
  }
})

function close() {
  remote.BrowserWindow.getFocusedWindow().close();
}

function maximize() {
  remote.BrowserWindow.getFocusedWindow().maximize();
}

function minimize() {
  remote.BrowserWindow.getFocusedWindow().minimize();
}

async function parseFeed(feed) {
  const feeds = await feed.all();
  return feeds.filter(t => t.accounts.length)
    .map(t => ({
      accounts: t.accounts.map(a => a._params),
      items: t.items.map(i => i._params),
      id: t.id,
      lastactivity: t._params.lastActivityAt
    }));
};



async function register(user, pass) {
  let session = await Client.Session.create(new Client.Device('android'), new Client.CookieFileStorage('./user.json'), user, pass)
  return session;
}

async function getInbox() {
  const inboxFeed = await new Client.Feed.Inbox(session);
  const feeds = await parseFeed(inboxFeed);
  return feeds;
}

async function getChat(id, cursor) {
  const tFeed = new Client.Feed.ThreadItems(session, id);
  if (cursor != undefined) {
    console.log("cursor aknowledgement")
    tFeed.setCursor(cursor);
  }
  const tFeedIt = await tFeed.get();
  /*console.log("FEED *************************************")
  console.log(tFeedIt)
  console.log("*************************************")*/
  return {
    f: tFeedIt,
    cursor: tFeed.getCursor(),
    moreAvaible: tFeed.moreAvailable
  };
}

async function getNewTimestamps() {
  var inbox = await getInbox();
  //console.log(oldtimestamps);
  //console.log(n);
  if (oldtimestamps.length != 0){
    for (t in inbox) {
      //console.log(new Date(oldtimestamps[t].lastactivity) )
      //console.log(new Date(inbox[t].lastactivity) )
      if (new Date(oldtimestamps[t].lastactivity) < new Date(inbox[t].lastactivity)) {
        //console.log("lol")
        console.log(oldtimestamps[t].id)

        //feeds_ = await parseFeed(inboxFeed);
        //domChats(feeds_)

        if (oldtimestamps[t].id == app.chatid) {

          let thischat = app.chat.map(a => a.timestamp);
          let newchat = await getChat(oldtimestamps[t].id);
          let mapnewchat = newchat.f.map(a => a._params.created);
          let formattednewchat = chatparser(newchat)
          diff = mapnewchat.diff(thischat)
          for (var i = app.chat.length - 1; i >= 0; --i) {
              if (app.chat[i].unsent === true) {
                  app.chat.splice(i,1);
              }
          }
          diff.indexes.reverse();
          for (i = 0; i < diff.indexes.length ; i++){
              app.chat.push(formattednewchat[diff.indexes[i]])
              if (formattednewchat[diff.indexes[i]].me == false){
                let myNotification = new Notification('Nuovo messaggio', {body: 'Lorem Ipsum Dolor Sit Amet'})
              }

          }
          Vue.nextTick(function () {
            $(".chat-pane").scrollTop(document.getElementsByClassName("chat-pane")[0].scrollHeight);
            updatingFlag = false;
          })
          console.log("this chat need to be updated");
        }
        break;
      }
    }
  }else{
    console.log("populating old timestamps")
  }
  oldtimestamps = inbox;
}

require('electron-css-reload')();
/*
async function login(){
  $(".window-content").addClass("blur");
  $(".center-form").show();
  $(".button-login").click(async function(){
    bf = new Blowfish($("#username").val());
    console.log(bf.encrypt($("#password").val()));
    console.log("lol")
    let session = await register($("#username").val(),$("#password").val());
    console.log(session);
    instachat();
  })
}*/
