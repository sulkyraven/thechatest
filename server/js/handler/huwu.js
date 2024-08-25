const db = require("../db");

module.exports = {
  validate(requires=[], snap) {
    if(!snap) return {res:{code:400,msg:'ERROR'}};
    const valids = requires.filter(s => {
      return Object.keys(snap).find(key => key == s && typeof snap[key] === 'string');
    });
    if(valids.length !== requires.length) return {res:{code:400,msg:'ERROR'}};
    return {valid:true,res:{code:200,msg:'ok'}};
  },
  setUsername(uid, s) {
    if(!this.validate(['uname'], s).valid) return this.validate.res;

    const udb = db.ref.u[uid];
    if(udb.lastuname && udb.lastuname > Date.now()) return {code:402,msg:udb.lastuname};
    if(s.uname.length < 4 || s.uname.length > 20) return {code:400,msg:'ACC_FAIL_UNAME_LENGTH'};

    const unamevalid = /^[A-Za-z0-9._]+$/;
    const unamedeny = /^user/;
    if(!s.uname.match(unamevalid)) return {code:400,msg:'ACC_FAIL_UNAME_FORMAT'};
    if(s.uname.match(unamedeny)) return {code:400,msg:'ACC_FAIL_CLAIMED'};
    if(['dvnkz','dvnkz_','devanka','devanka761','devanka7','devanka76'].includes(s.uname)) return {code:400,msg:'ACC_FAIL_CLAIMED'};

    db.ref.u[uid].uname = s.uname;
    db.ref.u[uid].lastuname = Date.now() + (1000*60*60*24*7);
    db.save('u');

    return {code:200,msg:'ok',data:{text:s.uname}};
  }
}