const fs = require('fs');
const db = require("../db");
const { validate } = require('../middlewares');
const hprofile = require('./hprofile');

module.exports = {
  create(uid, s) {
    if(!validate(['name'], s)) return {code:400};
    const transname = /(\s)(?=\s)/g;
    s.name = s.name.replace(transname, '').trim();

    const ogdb = db.ref.g;
    const oldGroups = Object.keys(ogdb).filter(k => {
      return ogdb[k].o = uid;
    });

    if(oldGroups.length >= 2) return {code:400,msg:'GRPS_OWN_MAX'};

    const gid = 'G' + Date.now().toString(32);

    const data = { o: uid, u: [uid], n: s.name, t: '1', c:{}};
    db.ref.g[gid] = data;
    db.save('g');

    let retdata = {...data, id:gid};
    retdata.users = data.u.filter(k => k !== uid).map(k => hprofile.getUser(uid, {id:k}));

    return {code:200,msg:'ok',data:{group:retdata}};
  },
  setImage(uid, s) {
    if(!validate(['img', 'name'], s)) return {code:400};
  }
}