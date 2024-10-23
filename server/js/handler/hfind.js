const db = require("../db");
const hgroup = require("./hgroup");
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
  },
  searchRandom(uid) {
    const udb = db.ref.u;
    const users = Object.keys(udb).filter(key => {
      return key !== uid;
    });
    const findArr = [];
    const randomUser = () => {
      const nwUser = users.filter(k => !findArr.includes(k));
      return nwUser[Math.floor(Math.random() * nwUser.length)];
    }
    const maxLength = users.length >= 3 ? 3 : users.length;
    for(let i=0;i<maxLength;i++) {
      findArr.push(randomUser());
    }
    const findUser = findArr.map(k => {
      return hprofile.getUser(uid, {id:k});
    });
    return {code:200,msg:'ok',data:{users:findUser}};
  },
  groupInvite(uid, p = null) {
    if(!p) return {code:400};

    const gdb = db.ref.g;
    const gkey = Object.keys(gdb).find(key => gdb[key].l === p);
    if(!gkey) return {code:400};

    const group = hgroup.getGroup(uid, {id:gkey});
    if(!group?.code || group?.code === 200) return {code:200,data:group};
    return group;
  }
}