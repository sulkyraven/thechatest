const fs = require('fs');
const helper = require('../helper');
const db = require('../db');
const hcloud = require('./hcloud');
const { validate } = require('../middlewares');

module.exports = {
  set(uid, s) {
    if(!validate(['id'], s)) return null;
    const friendkey = Object.keys(db.ref.f).find(k => {
      return db.ref.f[k].includes(s.id) && db.ref.f[k].includes(uid);
    });
    if(!friendkey) return {code:400};

    const callKey = 'vc' + Date.now().toString(32);
    db.ref.v[callKey] = { t: 0, o: Date.now() + (1000 * 10), u: { [uid]: {j:true}, [s.id]: {j:false} } }
    db.save('v');

    return {code:200};
  },
  receive(uid, s) {
    if(!validate(['id'], s)) return null;

    const callKey = Object.keys(db.ref.v).find(k => {
      return db.ref.v[k].u?.[s.id] && db.ref.v[k].u?.[uid];
    });
    if(!callKey) return {code:400};

    db.ref.v[callKey].u[uid].j = true;
    db.save('v');

    return {code:200};
  }
}