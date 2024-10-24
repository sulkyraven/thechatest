const nodemailer = require('nodemailer');
const fs = require('fs');
const helper = require('../helper');
const db = require('../db');
const hcloud = require('./hcloud');
const { validate } = require('../middlewares');

// const mailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
// const usernameregex = /^[A-Za-z0-9_]+$/;
module.exports = {
  login(s) {
    if(!validate(['email'], s)) return {code:400,msg:'AUTH_ERR_01'};
    const mailvalid = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    if(!s.email.match(mailvalid)) return {code:400,msg:'AUTH_ERR_02'};
    if(s.email.length > 200) return  {code:400,msg:'AUTH_ERR_02'};

    let tempid = 'u' + Date.now().toString(32);

    const emailKey = Object.keys(db.ref.t).find(key => db.ref.t[key].email == s.email);

    if(emailKey) tempid = emailKey;

    const gencode = helper.rNumber(6);
    db.ref.t[tempid] = {
      email: s.email,
      otp: { code: gencode, expiry: Date.now() + (1000 * 60 * 10) }
    }
    db.save('t');

    emailCode(s.email, gencode);
    return {code:200,msg:'ok',data:{step:1}}
  },
  verify(s) {
    if(!validate(['email'], s)) return {code:400,msg:'AUTH_ERR_01'};
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
    let data = { step:2, user: { email }}
    let ukey = Object.keys(udb).find(key => udb[key].email == email);
    if(!ukey) {
      ukey = '7' + helper.rNumber(5).toString() + (Object.keys(udb).length + 1).toString();
      db.ref.u[ukey] = {email,bio:'No bio yet.',uname:`user${ukey}`,dname:`User D${ukey}`,j:Date.now()};
      data.first = true;
      db.save('u');
    }

    data.user.id = ukey;

    delete db.ref.t[dbkey];
    db.save('t');

    data.cloud = hcloud.initPeers(ukey);
    return {code:200,msg:'ok',data};
  },
  getPeer(uid) {
    const udb = db.ref.u[uid];
    if(!udb) return {code:400};
    if(!udb.peer) return {code:400};
    
    return {code:200,data:{peer:udb.peer}};
  }
}

function emailCode(user_email, gen_code) {
  const transport = nodemailer.createTransport({
    host: "mail.devanka.id",
    port: 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const email_file = fs.readFileSync('./server/html/email_login.ejs', 'utf8').replace(/{GEN_CODE}/g, gen_code);

  transport.sendMail({
    from: `"Kirimin" <${process.env.SMTP_USER}>`,
    to: user_email,
    subject: "Login Authentication Code",
    html: email_file
  }).catch((err) => {
    console.log(err);
  }).finally(() => {
    transport.close();
  });
};
