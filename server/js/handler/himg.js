const fs = require('fs');
const db = require('../db');

module.exports = {
  user(s) {
    const idb = db.ref.u[s]?.img;
    if(!idb) return {code:404}
    if(!fs.existsSync(`./server/dbimg/user/${idb}`)) return {code:404};
    return {code:200,data:{name:`./server/dbimg/user/${idb}`}};
  },
  group(s) {
    const idb = db.ref.g[s]?.i;
    if(!idb) return {code:404};
    if(!fs.existsSync(`./server/dbimg/group/${idb}`)) return {code:404};
    return {code:200,data:{name:`./server/dbimg/group/${idb}`}};
  }
}