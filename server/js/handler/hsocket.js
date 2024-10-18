const util = require('util');
const db = require("../db");
const hcloud = require("./hcloud");
const { validate } = require('../middlewares');

module.exports = {
  readMsg(uid, s) {
    if(!validate(['id'], s)) return null;
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
  voiceCall(uid, s) {
    if(!validate(['id'], s)) return null;

    const callKey = Object.keys(db.ref.v).find(k => {
      return db.ref.v[k].u?.[s.id] && db.ref.v[k].u?.[uid];
    });
    if(!callKey) return null;
    return {data:[
      {
        'name': 'vcall',
        'data': db.ref.v[callKey]
      }
    ]}
  },
  callMicOff(uid, s) {
    if(!validate(['id'], s)) return null;
    const callKey = Object.keys(db.ref.v).find(k => {
      return db.ref.v[k].u?.[s.id] && db.ref.v[k].u?.[uid];
    });
    if(!callKey) return null;
    db.ref.v[callKey].u[uid].micOff = true;
    db.save('v');
    return null;
  },
  callMicOn(uid, s) {
    if(!validate(['id'], s)) return null;
    const callKey = Object.keys(db.ref.v).find(k => {
      return db.ref.v[k].u?.[s.id] && db.ref.v[k].u?.[uid];
    });
    if(!callKey) return null;
    if(db.ref.v[callKey].u[uid].micOff) {
      delete db.ref.v[callKey].u[uid].micOff;
      db.save('v');
    }
    return null;
  },
  callVolOff(uid, s) {
    if(!validate(['id'], s)) return null;
    const callKey = Object.keys(db.ref.v).find(k => {
      return db.ref.v[k].u?.[s.id] && db.ref.v[k].u?.[uid];
    });
    if(!callKey) return null;
    db.ref.v[callKey].u[uid].volOff = true;
    db.save('v');
    return null;
  },
  callVolOn(uid, s) {
    if(!validate(['id'], s)) return null;
    const callKey = Object.keys(db.ref.v).find(k => {
      return db.ref.v[k].u?.[s.id] && db.ref.v[k].u?.[uid];
    });
    if(!callKey) return null;
    if(db.ref.v[callKey].u[uid].volOff) {
      delete db.ref.v[callKey].u[uid].volOff;
      db.save('v');
    }
    return null;
  },
  run(uid, s) {
    if(this[s.id]) return this[s.id](uid, s.data);
    return {code:400};
  }
};