const db = require("../db");
const { genPeer, peerKey } = require("../helper");
const hchat = require("./hchat");
const hgroup = require("./hgroup");
const hprofile = require("./hprofile");

const clientData = ['getAccount','getChats','getFriends','getGroups'];

module.exports = {
  getAccount(uid) {
    const udb = db.ref.u[uid];
    if(!udb) return {};

    let data = {email: udb.email, username: udb.uname, displayName: udb.dname, bio: udb.bio, id:uid}
    if(udb.b) data.b = udb.b;
    if(udb.img) data.img = udb.img;
    if(udb.req) data.req = udb.req.map(k => hprofile.getUser(uid, {id:k}));
    if(udb.lg) data.lg = udb.lg;
    return {name:'account', data};
  },
  initPeers(uid) {
    let peerid = genPeer();
    db.ref.u[uid].peer = peerid;
    db.ref.u[uid].lg = Date.now();

    return [...this.getAll(uid), {name:'peersinit', data: { peerKey, peerid }}];
  },
  getChats(uid) {
    const cdb = db.ref.c;
    const myChats = Object.keys(cdb).filter(key => {
      return cdb[key].u.includes(uid);
    }).map(key => {
      return {
        id: key,
        users: cdb[key].u.filter(k => k !== uid).map(k => hprofile.getUser(uid, {id:k})),
        chats: Object.keys(cdb[key].c).map(k => hchat.getChat(uid, {ckey:'c', id:key, text_id:k}))
      }
    });
    return {name:'chats',data:myChats}
  },
  getFriends(uid) {
    const fdb = db.ref.f;
    const myFriends = Object.keys(fdb).filter(k => {
      return fdb[k].includes(uid);
    }).map(k => {
      return hprofile.getUser(uid,{id:fdb[k].find(ck => ck !== uid)});
    });
    return {name:'friends',data:myFriends}
  },
  getGroups(uid) {
    const gdb = db.ref.g;
    const myGroups = Object.keys(gdb).filter(k => {
      return gdb[k].u.includes(uid) && !hgroup.getGroup(uid, {id:k})?.code;
    }).map(k => {
      return hgroup.getGroup(uid, {id:k});
    });

    return {name:'groups',data:myGroups};
  },
  getAll(uid) {
    return Object.keys(this).filter(key => clientData.includes(key)).map(key => this[key](uid));
  }
}