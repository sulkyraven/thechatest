const util = require('util');
const db = require("../db");
const hcloud = require("./hcloud");

module.exports = {
  readMsg(uid, s) {
    const child = db.ref.c[s.id] ? 'c' : db.ref.g[s.id] ? 'g' : null;
    if(!child) return {code:400};
    
    const cdb = db.ref[child][s.id].c;
    Object.keys(cdb).filter(k => cdb[k].u !== uid && cdb[k].unread).forEach(k => {
      delete db.ref[child][s.id].c[k].unread;
    });
    db.save(child);

    const data = [hcloud.getChats(uid), hcloud.getGroups(uid)];

    return {data};
  },
  run(uid, s) {
    if(this[s.id]) return this[s.id](uid, s.data);
    return {code:400};
  }
};