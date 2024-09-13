const fs = require('fs');
const db = require("../db");
const {validate} = require('../middlewares');

module.exports = {
  sendMessage(uid, s) {
    if(!validate(['id'], s)) return {code:400};
    if(typeof s?.conty !== 'number') return {code:400};
    const conty = s.conty === 1 ? 'c' : 'g';
    const cdb = db.ref[conty];
    const ckey = s.conty === 1 ? Object.keys(cdb).find(k => cdb[k].u.filter(ck => [uid, s.id].includes(ck))) : cdb[s.id] ? s.id : null;
    if(!ckey) return {code:400};

    if(!s.txt && !s.file) return {code:400};
    const data = {};
    data.u = uid;
    if(s.rep) {
      if(!validate(['rep'], s)) return {code:400};
      if(cdb[ckey].c[s.rep]) data.r = s.rep;
    }
    if(s.txt) {
      if(!validate(['txt'], s)) return {code:400};
      const transtxt = /(\s)(?=\s)/g;
      s.txt = s.txt.replace(transtxt, '').trim();
      const wsonly = /^\s+$/;
      if(wsonly.test(s.txt)) return {code:400};
      data.txt = s.txt;
    }
    if(s.file) {
      if(!validate(['name', 'content'], s.file)) return {code:400};
      if(s.file.name.length > 100) return {code:400,msg:'FILENAME_LENGTH'};
      const dataurl = decodeURIComponent(s.file.content);
      const buffer = Buffer.from(dataurl.split(',')[1], 'base64');
      if(buffer.length > 2000000) return {code:402,msg:'ACC_IMG_LIMIT'}
      
      if(!fs.existsSync('./server/dbfile')) fs.mkdirSync('./server/dbfile');
      if(!fs.existsSync(`./server/dbfile/content`)) fs.mkdirSync(`./server/dbfile/content`);
      if(!fs.existsSync(`./server/dbfile/content/${ckey}`)) fs.mkdirSync(`./server/dbfile/content/${ckey}`);
      const filename = `F${Date.now().toString(32)}_${s.file.name}`;
      fs.writeFileSync(`./server/dbfile/content/${ckey}/${filename}`, buffer);
      data.i = filename;
    }

    data.ts = Date.now();
    data.unread = true;

    if(!db.ref[conty][ckey].c) db.ref[conty][ckey].c = {};
    const newKey = 'c' + Date.now().toString(32);

    db.ref[conty][ckey].c[newKey] = data;
    db.save(conty);

    return {code:200,data: {...data,id:newKey}};
  },
}