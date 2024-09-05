const fs = require('fs');
const db = require("../db");
const { validate } = require('../middlewares');
module.exports = {
  setUsername(uid, s) {
    if(!validate(['uname'], s)) return {code:400};

    const udb = db.ref.u[uid];
    if(udb.lastuname && udb.lastuname > Date.now()) return {code:402,msg:udb.lastuname};
    if(s.uname.length < 4 || s.uname.length > 20) return {code:400,msg:'ACC_FAIL_UNAME_LENGTH'};

    const unamevalid = /^[A-Za-z0-9._]+$/;
    const unamedeny = /^user/;
    if(!s.uname.match(unamevalid)) return {code:400,msg:'ACC_FAIL_UNAME_FORMAT'};
    if(s.uname.match(unamedeny)) return {code:400,msg:'ACC_FAIL_CLAIMED'};
    if(['dvnkz','dvnkz_','devanka','devanka761','devanka7','devanka76'].includes(s.uname)) return {code:400,msg:'ACC_FAIL_CLAIMED'};
    if(s.uname === udb.uname) return {code:200,msg:'ok',data:{text:s.uname}};

    db.ref.u[uid].uname = s.uname;
    db.ref.u[uid].lastuname = Date.now() + (1000*60*60*24*7);
    db.save('u');

    return {code:200,msg:'ok',data:{text:s.uname}};
  },
  setBio(uid, s) {
    if(!validate(['bio'], s)) return {code:400};
    const udb = db.ref.u[uid];
    if(udb.lastbio && udb.lastbio > Date.now()) return {code:402,msg:udb.lastbio};
    const transbio = /(\s)(?=\s)/g;
    s.bio = s.bio.replace(transbio, '').trim();
    if(s.bio === udb.bio) return {code:200,msg:'ok',data:{text:s.bio}};
    if(s.bio.length > 200) return {code:400,msg:'ACC_FAIL_BIO_LENGTH'};
    const wsonly = /^\s+$/;
    if(wsonly.test(s.bio)) return {code:200,msg:'ok',data:{text:udb.bio}};

    db.ref.u[uid].bio = s.bio;
    db.ref.u[uid].lastbio = Date.now() + (1000*60*60);
    db.save('u');

    return {code:200,msg:'ok',data:{text:s.bio}};
  },
  setDisplayName(uid, s) {
    if(!validate(['dname'], s)) return {code:400};
    const udb = db.ref.u[uid];
    if(udb.lastdname && udb.lastdname > Date.now()) return {code:402,msg:udb.lastdname};
    const transdname = /(\s)(?=\s)/g;
    s.dname = s.dname.replace(transdname, '').trim();
    if(s.dname === udb.dname) return {code:200,msg:'ok',data:{text:s.dname}};
    if(s.dname.length > 35) return {code:400,msg:'ACC_FAIL_DNAME_LENGTH'};
    const wsonly = /^\s+$/;
    if(wsonly.test(s.dname)) return {code:200,msg:'ok',data:{text:udb.dname}};

    db.ref.u[uid].dname = s.dname;
    db.ref.u[uid].lastdname = Date.now() + (1000*60*60*24*3);
    db.save('u');

    return {code:200,msg:'ok',data:{text:s.dname}};
  },
  setImage(uid, s) {
    if(!validate(['img', 'name'], s)) return {code:400};
    const dataurl = decodeURIComponent(s.img);
    const buffer = Buffer.from(dataurl.split(',')[1], 'base64');
    if(buffer.length > 2000000) return {code:400,msg:'ACC_IMG_LIMIT'}

    if(!fs.existsSync('./server/dbimg')) fs.mkdirSync('./server/dbimg');
    if(!fs.existsSync(`./server/dbimg/user`)) fs.mkdirSync(`./server/dbimg/user`);

    const udb = db.ref.u[uid];
    if(udb.img) if(fs.existsSync(`./server/dbimg/user/${udb.img}`)) fs.unlinkSync(`./server/dbimg/user/${udb.img}`);

    const imgExt = /\.([a-zA-Z0-9]+)$/;
    const imgName = `${uid}.${s.name.match(imgExt)[1]}`;
    fs.writeFileSync(`./server/dbimg/user/${imgName}`, buffer);

    db.ref.u[uid].img = imgName;
    db.save('u');

    return {code:200,msg:'ok'};
  },
}