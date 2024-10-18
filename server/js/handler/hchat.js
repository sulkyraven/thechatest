const fs = require('fs');
const db = require("../db");
const {validate} = require('../middlewares');
const hprofile = require('./hprofile');

function compareArrays(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;

  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();

  return sorted1.every((value, index) => value === sorted2[index]);
};

function findMatchingGroup(group_us, group_all) {
  for (const [groupName, groupData] of Object.entries(group_all)) {
    if (compareArrays(group_us, groupData.u)) {
      return groupName;
    }
  }
  return null;
};

module.exports = {
  getChat(uid, s) {
    if(!validate(['ckey', 'id', 'text_id'], s)) return {code:400};
    if(s.ckey !== 'c' && s.ckey !== 'g') return {code:400};
    s.id = s.id.toLowerCase();
    const cdb = db.ref[s.ckey][s.id]?.c?.[s.text_id];
    if(!cdb) return {code:400};

    const data = {};
    data.id = s.text_id;
    data.u = cdb.u === uid ? {id:uid} : {...hprofile.getUser(uid, {id:cdb.u})};
    data.ts = cdb.ts;
    if(cdb.r) data.r = cdb.r;
    if(cdb.w) data.w = cdb.w;
    if(cdb.d) {
      data.d = cdb.d;
    } else {
      if(cdb.v) data.v = cdb.v;
      if(cdb.txt) data.txt = cdb.txt;
      if(cdb.i) data.i = cdb.i;
      if(cdb.e) data.e = cdb.e;
    }
    return data;
  },
  sendMessage(uid, s) {
    // if(!s.makan) return {code:400,msg:'just for testing'};
    if(!validate(['id'], s)) return {code:400};
    s.id = s.id.toLowerCase();
    if(typeof s?.conty !== 'number') return {code:400};
    const conty = s.conty === 1 ? 'c' : 'g';
    const cdb = db.ref[conty];
    let ckey = s.conty === 1 ? findMatchingGroup([uid, s.id], db.ref.c) : cdb[s.id] ? s.id : null;
    if(!ckey && conty === 'g') return {code:400};
    if(!ckey && conty === 'c') {
      ckey = 'm' + Date.now().toString(32);
      db.ref.c[ckey] = {};
      db.ref.c[ckey].u = [uid, s.id];
      db.ref.c[ckey].c = {};
    }
    if(!s.txt && !s.file && !s.voice) return {code:400};
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
    if(s.edit) {
      s.edit = s.edit.toLowerCase();
      if(!cdb[ckey].c[s.edit]) return {code:400,data:{edit:s.edit}};
      if(!cdb[ckey].c[s.edit].txt) return {code:400,data:{edit:s.edit}};

      db.ref[conty][ckey].c[s.edit].txt = s.txt;
      db.ref[conty][ckey].c[s.edit].e = Date.now();
      db.save(conty);

      const peers = db.ref[conty][ckey].u.filter(k => k !== uid && db.ref.u[k]?.peer)?.map(k => {
        return db.ref.u[k].peer;
      }) || [];

      return {code:200,data: {...db.ref[conty][ckey].c[s.edit],id:s.edit,ckey,u:{id:uid}}, peers};
    } else if(s.voice) {
      if(!validate(['voice'], s)) return {code:400};
      const dataurl = decodeURIComponent(s.voice);
      const buffer = Buffer.from(dataurl.split(',')?.[1], 'base64');
      if(buffer.length > 2000000) return {code:402,msg:'ACC_FILE_LIMIT'};
      if(!fs.existsSync('./server/dbfile')) fs.mkdirSync('./server/dbfile');
      if(!fs.existsSync(`./server/dbfile/content`)) fs.mkdirSync(`./server/dbfile/content`);
      if(!fs.existsSync(`./server/dbfile/content/${ckey}`)) fs.mkdirSync(`./server/dbfile/content/${ckey}`);
      const filename = `F${Date.now().toString(32)}.ogg`;
      fs.writeFileSync(`./server/dbfile/content/${ckey}/${filename}`, buffer);
      data.v = filename;
    } else if(s.file) {
      if(!validate(['name', 'src'], s.file)) return {code:400};
      if(s.file.name.length > 100) return {code:400,msg:'FILENAME_LENGTH'};
      const dataurl = decodeURIComponent(s.file.src);
      const buffer = Buffer.from(dataurl.split(',')?.[1], 'base64');
      if(buffer.length > 3000000) return {code:402,msg:'ACC_FILE_LIMIT'};

      if(!fs.existsSync('./server/dbfile')) fs.mkdirSync('./server/dbfile');
      if(!fs.existsSync(`./server/dbfile/content`)) fs.mkdirSync(`./server/dbfile/content`);
      if(!fs.existsSync(`./server/dbfile/content/${ckey}`)) fs.mkdirSync(`./server/dbfile/content/${ckey}`);
      const filename = `F${Date.now().toString(32)}_${s.file.name.replace(/\s/g, '_')}`;
      fs.writeFileSync(`./server/dbfile/content/${ckey}/${filename}`, buffer);
      data.i = filename;
    }

    data.ts = Date.now();

    if(!db.ref[conty][ckey].c) db.ref[conty][ckey].c = {};
    const newKey = 'c' + Date.now().toString(32);

    db.ref[conty][ckey].c[newKey] = data;
    db.save(conty);

    const peers = db.ref[conty][ckey].u.filter(k => k !== uid && db.ref.u[k]?.peer)?.map(k => {
      return db.ref.u[k].peer;
    }) || [];

    return {code:200,data: {...data,id:newKey,ckey,u:{id:uid}}, peers};
  },
  delMessage(uid, s) {
    if(!validate(['id', 'text_id'], s)) return {code:400};
    s.id = s.id.toLowerCase();
    s.text_id = s.text_id.toLowerCase();
    if(typeof s?.conty !== 'number') return {code:400};
    const conty = s.conty === 1 ? 'c' : 'g';
    const cdb = db.ref[conty];
    let ckey = s.conty === 1 ? findMatchingGroup([uid, s.id], db.ref.c) : cdb[s.id] ? s.id : null;
    if(!ckey) return {code:400};
    if(!cdb[ckey].c[s.text_id]) return {code:400,data:{text_id:s.text_id}};
    if(cdb[ckey].c[s.text_id].e) delete db.ref[conty][ckey].c[s.text_id].e;

    db.ref[conty][ckey].c[s.text_id].d = Date.now();

    const newData = {...db.ref[conty][ckey].c[s.text_id]};
    if(newData.txt) {
      delete db.ref[conty][ckey].c[s.text_id].txt;
      delete newData.txt;
    }
    if(newData.v) {
      if(fs.existsSync(`./server/dbfile/content/${ckey}/${newData.v}`)) fs.unlinkSync(`./server/dbfile/content/${ckey}/${newData.v}`);
      delete db.ref[conty][ckey].c[s.text_id].v;
      delete newData.v;
    }
    if(newData.i) {
      if(fs.existsSync(`./server/dbfile/content/${ckey}/${newData.i}`)) fs.unlinkSync(`./server/dbfile/content/${ckey}/${newData.i}`);
      delete db.ref[conty][ckey].c[s.text_id].i;
      delete newData.i;
    }

    db.save(conty);


    const peers = db.ref[conty][ckey].u.filter(k => k !== uid && db.ref.u[k]?.peer)?.map(k => {
      return db.ref.u[k].peer;
    }) || [];


    return {code:200,data: {...newData, id:s.text_id, ckey, u:{id:uid}}, peers};
  }
}