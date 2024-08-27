const db = require("../db");
const { genPeer, peerKey } = require("../helper");
const hprofile = require("./hprofile");

const clientData = ['getAccount','getPeers','getChats','getFriends'];

module.exports = {
  socket(uid, s) {
    console.log('run:', uid, s);
    return {code:200,msg:'ok',data:'socket'}
  },
  getAccount(uid) {
    const udb = db.ref.u[uid];
    if(!udb) return {};

    let data = {email: udb.email, username: udb.uname, displayName: udb.dname, bio: udb.bio, id:uid}
    if(udb.img) data.img = udb.img;
    if(udb.req) data.req = udb.req;
    return {name:'account', data};
  },
  getPeers(uid) {
    let peerid = null;
    if(db.ref.u[uid].peer) {
      peerid = db.ref.u[uid].peer;
    } else {
      peerid = genPeer();
      db.ref.u[uid].peer = peerid;
    }

    return {name:'peers', data: { peerKey, peerid, otherpeers: db.ref.x }};
  },
  getChats(uid) {
    const cdb = db.ref.c;
    const myChats = Object.keys(cdb).filter(key => {
      return cdb[key].u.includes(uid);
    }).map(key => {
      return {
        id: key,
        users: cdb[key].u.filter(k => k !== uid).map(k => hprofile.getUser(uid, {id:k})),
        chats: Object.keys(cdb[key].c).map(k => { return {...cdb[key].c[k], id:k}})
      }
    });
    return {name:'chats',data:myChats}
  },
  getAll(uid) {
    return Object.keys(this).filter(key => clientData.includes(key)).map(key => this[key](uid));
  }
}