const fs = require('fs');
const helper = require('../helper');
const db = require('../db');
const hcloud = require('./hcloud');

// const mailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
// const usernameregex = /^[A-Za-z0-9_]+$/;
module.exports = {
  login(s) {
    if(!s || typeof s?.email !== 'string') return {code:400,msg:'AUTH_ERR_01'};
    const mailvalid = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    if(!s.email.match(mailvalid)) return {code:400,msg:'AUTH_ERR_02'};
    if(s.email.length > 200) return  {code:400,msg:'AUTH_ERR_02'};

    let tempid = 'u' + Date.now().toString(32);

    const emailKey = Object.keys(db.ref.t).find(key => db.ref.t[key].email == s.email);

    if(emailKey) tempid = emailKey;

    let gencode = helper.rNumber(6);
    db.ref.t[tempid] = {
      email: s.email,
      otp: { code: gencode, expiry: Date.now() + (1000 * 60 * 15) }
    }
    db.save('t');
    return {code:200,msg:'ok',data:{step:1}}
  },
  verify(s) {
    if(!s || typeof s?.email !== 'string') return {code:400,msg:'AUTH_ERR_01'};
    const mailvalid = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    if(!s.email.match(mailvalid)) return {code:400,msg:'AUTH_ERR_02'};
    if(s.email.length > 200) return  {code:400,msg:'AUTH_ERR_02'};
    if(typeof Number(s?.code) !== 'number') return {code:400,msg:'AUTH_ERR_03'};
    s.code = Number(s.code);

    const tdb = db.ref.t;
    const dbkey = Object.keys(tdb).find(key => tdb[key].email == s.email);
    if(!dbkey) return {code:400,msg:'AUTH_ERR_04',data:{status:1}};
    if(tdb[dbkey].otp.code !== s.code) return {code:400,msg:'AUTH_ERR_04',data:{status:2}};
    if(tdb[dbkey].otp.expiry < Date.now()) return {code:402,msg:'AUTH_ERR_05'};

    return this.processUser(s.email, dbkey);
  },
  processUser(email, dbkey) {
    const udb = db.ref.u;
    let data = { step:2, user: { email }
    }
    let ukey = Object.keys(udb).find(key => udb[key].email == email);
    if(!ukey) {
      ukey = '7' + helper.rNumber(5).toString() + (Object.keys(udb).length + 1).toString();
      db.ref.u[ukey] = {email,bio:'No bio yet.',uname:`user${ukey}`,dname:`User D${ukey}`};
      data.first = true;
      db.save('u');
    }

    data.user.id = ukey;

    delete db.ref.t[dbkey];
    db.save('t');

    data.cloud = hcloud.getAll(ukey);
    return {code:200,msg:'ok',data};
  }
}