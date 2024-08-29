const db = require("../db");
const hprofile = require("./hprofile");

module.exports = {
  searchUsers(uid, q = null) {
    if(!q) return {code:400,msg:'FIND_NOTFOUND'};
    if(q.length < 4) return {code:400,msg:'FIND_LENGTH'};

    const udb = db.ref.u;
    const users = Object.keys(udb).filter(key => {
      return key !== uid && (key === q || udb[key].uname.includes(q));
    }).slice(0,9).map(key => {
      return hprofile.getUser(uid,{id:key});
    });
    return {code:200,msg:'ok',data:{users}};
  }
}