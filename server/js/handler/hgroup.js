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
    if(!validate(['id', 'img', 'name'], s)) return {code:400};

    const gdb = db.ref.g[s.id];
    if(!gdb || gdb.o !== uid) return {code:400};

    const dataurl = decodeURIComponent(s.img);
    const buffer = Buffer.from(dataurl.split(',')[1], 'base64');
    if(buffer.length > 2000000) return {code:400, msg: 'ACC_IMG_LIMIT'};

    if(!fs.existsSync('./server/dbimg')) fs.mkdirSync('./server/dbimg');
    if(!fs.existsSync(`./server/dbimg/group`)) fs.mkdirSync(`./server/dbimg/group`);

    if(gdb.img) if(fs.existsSync(`./server/dbimg/group/${gdb.img}`)) fs.unlinkSync(`./server/dbimg/group/${gdb.img}`);

    const imgExt = /\.([a-zA-Z0-9]+)$/;
    const imgName = `${s.id}.${s.name.match(imgExt)[1]}`;
    fs.writeFileSync(`./server/dbimg/group/${imgName}`, buffer);

    db.ref.g[s.id].i = imgName;
    db.save('g');

    return {code:200,msg:'ok'};
  },
  setGname(uid, s) {
    if(!validate(['id','gname'], s)) return {code:400};
    const gdb = db.ref.g[s.id];
    if(gdb.o !== uid) return {code:400};
    if(gdb.lastgname && gdb.lastgname > Date.now()) return {code:402,msg:gdb.lastgname};
    const transgname = /(\s)(?=\s)/g;
    s.gname = s.gname.replace(transgname, '').trim();
    if(s.gname === gdb.n) return {code:200,msg:'ok',data:{text:s.gname}};
    if(s.gname.length > 35) return {code:400,msg:'GRPS_DNAME_LENGTH'};
    const wsonly = /^\s+$/;
    if(wsonly.test(s.gname)) return {code:200,msg:'ok',data:{text:gdb.n}};

    db.ref.g[s.id].n = s.gname;
    db.ref.g[s.id].lastgname = Date.now() + (1000*60*60*24*3);
    db.save('g');

    return {code:200,msg:'ok',data:{text:s.gname}};
  }
}