require('es6-shim');
const remote = require('electron').remote;
var diff = require('recursive-diff');
var Client = require('instagram-private-api').V1;
var Promise = require('bluebird');
var Blowfish = require('blowfish');
var oldtimestamps;
var session;
var chatid = 0;
var userid = 0;
var cursor = 0;
var moreavaible = false;
var scrollheight = 0;
var updatingflag = false;


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
      accounts: t.accounts.map(a => a._params),
      items: t.items.map(i => i._params),
      id: t.id,
      lastactivity : new Date(t._params.lastActivityAt)
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

    feeds_ = await parseFeed(inboxFeed);
    //domChats(feeds_)

    if (oldtimestamps[t].id == app.chatid){
      console.log("this chat need to be updated");

    }
    break;
    }
  }
}

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
}
