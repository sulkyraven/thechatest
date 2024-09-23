const util = require('util');
const db = require("../db");
const hcloud = require("./hcloud");

module.exports = {
  readMsg(uid, s) {
    const child = db.ref.c[s.id] ? 'c' : db.ref.g[s.id] ? 'g' : null;
    if(!child) return {code:400};
    
    const cdb = db.ref[child][s.id].c;
    Object.keys(cdb).filter(k => cdb[k].u !== uid && (!cdb[k].w || !cdb[k].w.includes(uid))).forEach(k => {
      if(!db.ref[child][s.id].c[k].w) db.ref[child][s.id].c[k].w = [];
      db.ref[child][s.id].c[k].w.push(uid);
    });
    db.save(child);

    return {data:[hcloud.getChats(uid), hcloud.getGroups(uid)]};
  },
  receivedMsg(uid, s) {
    return {data: [hcloud.getChats(uid), hcloud.getGroups(uid)]}
  },
  getTalks(uid, s) {
    return {data: [hcloud.getChats(uid), hcloud.getFriends(uid), hcloud.getGroups(uid)]}
  },
  run(uid, s) {
    if(this[s.id]) return this[s.id](uid, s.data);
    return {code:400};
  }
};