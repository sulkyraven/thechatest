const fs = require('fs');
const db = require("../db");
const { validate } = require('../middlewares');
const hprofile = require('./hprofile');
const helper = require('../helper');
const hchat = require('./hchat');

module.exports = {
  getGroup(uid, s) {
    if(!validate(['id'], s)) return {code:400};
    s.id = s.id.toLowerCase();
    const gdb = db.ref.g[s.id];
    const data = {
      o: gdb.o, n:gdb.n, id:s.id, t:gdb.t,
      users: gdb.u.filter(k => k !== uid && !hprofile.getUser(uid, {id:k})?.code).map(k => hprofile.getUser(uid, {id:k})),
      chats: Object.keys(gdb.c).map(k => hchat.getChat(uid, {ckey:'g', id:s.id, text_id:k}))
    }
    if(gdb.i) data.i = gdb.i;
    if(gdb.o === uid || gdb.t === '0') data.l = gdb.l;
    return data;
  },
  create(uid, s) {
    if(!validate(['name'], s)) return {code:400};
    const transname = /(\s)(?=\s)/g;
    s.name = s.name.replace(transname, '').trim();

    const ogdb = db.ref.g;
    const oldGroups = Object.keys(ogdb).filter(k => ogdb[k].o = uid);

    if(oldGroups.length >= 2) return {code:400,msg:'GRPS_OWN_MAX'};

    const gid = 'g' + Date.now().toString(32);

    const data = { o: uid, u: [uid], n: s.name, t: '1', c:{}};
    data.l = `${helper.rString(2)}_${Date.now().toString(32)}_${helper.rString(2)}`;
    db.ref.g[gid] = data;
    db.save('g');

    const retdata = {...this.getGroup(uid, {id:gid})};
    return {code:200,msg:'ok',data:retdata};
  },
  setImage(uid, s) {
    if(!validate(['id', 'img', 'name'], s)) return {code:400};

    const gdb = db.ref.g[s.id];
    if(!gdb || gdb.o !== uid) return {code:400};

    const dataurl = decodeURIComponent(s.img);
    const buffer = Buffer.from(dataurl.split(',')[1], 'base64');
    if(buffer.length > 2000000) return {code:400, msg: 'ACC_IMG_LIMIT'};

    if(!fs.existsSync('./server/dbfile')) fs.mkdirSync('./server/dbfile');
    if(!fs.existsSync(`./server/dbfile/group`)) fs.mkdirSync(`./server/dbfile/group`);

    if(gdb.i) if(fs.existsSync(`./server/dbfile/group/${gdb.i}`)) fs.unlinkSync(`./server/dbfile/group/${gdb.i}`);

    const imgExt = /\.([a-zA-Z0-9]+)$/;
    const imgName = `${s.id}_${Date.now().toString(32)}.${s.name.match(imgExt)[1]}`;
    fs.writeFileSync(`./server/dbfile/group/${imgName}`, buffer);

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
    db.ref.g[s.id].lastgname = Date.now() + (1000*60*60*6);
    db.save('g');

    return {code:200,msg:'ok',data:{text:s.gname}};
  },
  setType(uid, s) {
    if(!validate(['id','t'], s)) return {code:400};
    const gdb = db.ref.g[s.id];
    if(gdb.o !== uid) return {code:400};
    if(!['0','1'].includes(s.t)) return {code:400};
    const glink = `${helper.rString(2)}_${Date.now().toString(32)}_${helper.rString(2)}`;
    if(gdb.t === s.t) {
      db.ref.g[s.id].l = glink;
      db.save('g');
      return {code:200,msg:'ok',data:{text:s.t,link:glink}};
    }
    db.ref.g[s.id].t = s.t;
    db.ref.g[s.id].l = glink;
    db.save('g');

    return {code:200,msg:'ok',data:{text:s.t,link:glink}};
  },
  leaveGroup(uid, s) {
    if(!validate(['id'], s)) return {code:400};
    s.id = s.id.toLowerCase();
    const gdb = db.ref.g[s.id];
    if(!gdb) return {code:400};
    if(!gdb.u.includes(uid)) return {code:400};
    db.ref.g[s.id].u = gdb.u.filter(k => k !== uid);
    db.save('g');

    return {code:200};
  },
  delGroup(uid, s) {
    if(!validate(['id'], s)) return {code:400};
    s.id = s.id.toLowerCase();
    const gdb = db.ref.g[s.id];
    if(!gdb) return {code:400};
    if(gdb.o !== uid) return this.leaveGroup(uid, s);
    if(gdb.i) if(fs.existsSync(`./server/dbfile/group/${gdb.i}`)) fs.unlinkSync(`./server/dbfile/group/${gdb.i}`);
    if(fs.existsSync(`./server/dbfile/content/${s.id}`)) fs.rmSync(`./server/dbfile/content/${s.id}`, {recursive:true,force:true});

    delete db.ref.g[s.id];
    db.save('g');

    return {code:200,msg:'ok'};
  },
  kickMember(uid, s) {
    if(!validate(['id', 'gid'], s)) return {code:400};
    s.gid = s.gid.toLowerCase();
    const gdb = db.ref.g[s.gid];
    if(!gdb) return {code:400};
    if(gdb.o !== uid) return {code:400};
    if(!gdb.u.includes(s.id)) return {code:400};

    db.ref.g[s.gid].u = gdb.u.filter(k => k !== s.id);
    db.save('g');
    return {code:200,data:{user:{id:s.id}}};
  },
  joinGroup(uid, s) {
    if(!validate(['id'], s)) return {code:400};
    s.id = s.id.toLowerCase();
    const gdb = db.ref.g[s.id];
    if(!gdb) return {code:404,msg:"GRPS_404"};
    if(gdb.u.includes(uid)) return {code:200, data:this.getGroup(uid, {id:s.id})};
    if(gdb.t === '1') return {code:402,msg:"GRPS_TYPE_PRIVATE"}
    db.ref.g[s.id].u.push(uid);
    db.save('g');
    return {code:200,data:this.getGroup(uid, {id:s.id})};
  }
}