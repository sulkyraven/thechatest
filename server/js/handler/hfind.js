const db = require("../db");
const hprofile = require("./hprofile");

module.exports = {
  validate(requires=[], snap) {
    if(!snap) return {res:{code:400,msg:'ERROR'}};
    const valids = requires.filter(s => {
      return Object.keys(snap).find(key => key == s && typeof snap[key] === 'string');
    });
    if(valids.length !== requires.length) return {res:{code:400,msg:'ERROR'}};
    return {valid:true,res:{code:200,msg:'ok'}};
  },
  searchUsers(uid, q = null) {
    if(!q) return {code:400,msg:'FIND_NOTFOUND'};
    if(q.length < 4) return {code:400,msg:'FIND_LENGTH'};

    const udb = db.ref.u;
    const users = Object.keys(udb).filter(key => {
      return key !== uid && (key === q || udb[key].uname.includes(q));
    }).slice(0,9).map(key => {
      // let data = {
      //   id: key, username: udb[key].uname,
      //   displayName: udb[key].dname,
      // }
      // if(udb[key].bio) data.bio = udb[key].bio;
      // if(udb[key].img) data.img = udb[key].img;
      // if(udb[key].req && udb[key].req.includes(uid)) data.myreq = true;
      return hprofile.getUser(uid,{id:key});
    });
    return {code:200,msg:'ok',data:{users}};
  }
}