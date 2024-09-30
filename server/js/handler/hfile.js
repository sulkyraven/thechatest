const fs = require('fs');
const db = require('../db');

module.exports = {
  user(s) {
    // const idb = db.ref.u[s]?.img;
    // if(!idb) return {code:404}
    if(!fs.existsSync(`./server/dbfile/user/${s}`)) return {code:404};
    return {code:200,data:{name:`./server/dbfile/user/${s}`}};
  },
  group(s) {
    // const idb = db.ref.g[s]?.i;
    // if(!idb) return {code:404};
    if(!fs.existsSync(`./server/dbfile/group/${s}`)) return {code:404};
    return {code:200,data:{name:`./server/dbfile/group/${s}`}};
  },
  content(uid, s) {
    const userAllow = db.ref.c[s.id]?.u?.find(k => k === uid) || db.ref.g[s.id]?.u?.find(k => k === uid) || null;
    if(!userAllow) return {code:403};
    if(!fs.existsSync(`./server/dbfile/content/${s.id}/${s.name}`)) return {code:404};
    return {code:200,data:{name:`./server/dbfile/content/${s.id}/${s.name}`}};
  }
}