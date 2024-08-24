const db = require("../db");
const { genPeer, peerKey } = require("../helper");

module.exports = {
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
      db.save('u');
    }

    return {name:'peers', data: { peerKey, peerid, otherpeers: db.ref.x }};
  },
  getAll(uid) {
    return Object.keys(this).filter(key => key != 'getAll').map(key => this[key](uid));
  }
}