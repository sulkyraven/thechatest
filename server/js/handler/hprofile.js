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
  getUser(uid, s) {
    if(!this.validate(['id'], s).valid) return this.validate.res;
    const udb = db.ref.u[s.id];
    if(!uid) return {code:400,msg:'FIND_NOTFOUND'};

    let data = {
      id: s.id, username: udb.uname,
      displayName: udb.dname,
    }
    if(udb.bio) data.bio = udb.bio;
    if(udb.img) data.img = udb.img;
    if(udb.req && udb.req.includes(uid)) data.myreq = true;
    const mdb = db.ref.u[uid];
    if(mdb.req && mdb.req.includes(s.id)) data.theirreq = true;
    const isFriend = Object.keys(db.ref.f).find(k => {
      return db.ref.f[k].u1 === uid && db.ref.f[k].u2 === s.id || db.ref.f[k].u2 === uid && db.ref.f[k].u1 === s.id 
    });
    if(isFriend) data.isfriend = true;
    return data;
  },
  addFriend(uid, s) {
    if(!this.validate(['id'], s).valid) return this.validate.res;
    const udb = db.ref.u[s.id];

    if(!udb) return {code:400};

    if(db.ref.u[uid].req?.includes(s.id)) return this.acceptFriend(uid,s);
    if(udb?.req?.includes(uid)) return {code:200,data:{user:this.getUser(uid,s)}};

    if(!udb.req) db.ref.u[s.id].req = [];
    db.ref.u[s.id].req.push(uid);
    db.save('u');
    return {code:200,data:{user:this.getUser(uid,s)}};
  },
  unFriend(uid, s) {
    if(!this.validate(['id'], s).valid) return this.validate.res;
    const udb = db.ref.u[s.id];
    if(!udb) return {code:400};
    
    if(udb.req?.includes(uid)) db.ref.u[s.id].req = udb.req.filter(key => key !== uid);
    const mdb = db.ref.u[uid];
    if(mdb.req?.includes(s.id)) db.ref.u[uid].req = mdb.req.filter(key => key !== s.id);

    const friendkey = Object.keys(db.ref.f).find(k => {
      return db.ref.f[k].u1 === uid && db.ref.f[k].u2 === s.id || db.ref.f[k].u2 === uid && db.ref.f[k].u1 === s.id 
    });
    if(friendkey) delete db.ref.f[friendkey];

    db.save('u','f');
    return {code:200,data:{user:this.getUser(uid,s)}};
  },
  acceptFriend(uid, s) {
    if(!this.validate(['id'], s).valid) return this.validate.res;
    const udb = db.ref.u[s.id];
    if(!udb) return {code:400};
    if(udb.req?.includes(uid)) db.ref.u[s.id].req = udb.req.filter(key => key !== uid);
    const mdb = db.ref.u[uid];
    if(mdb.req?.includes(s.id)) db.ref.u[uid].req = mdb.req.filter(key => key !== s.id);
    
    const friendkey = Object.keys(db.ref.f).find(k => {
      return db.ref.f[k].u1 === uid && db.ref.f[k].u2 === s.id || db.ref.f[k].u2 === uid && db.ref.f[k].u1 === s.id 
    });
    if(friendkey) return {code:400};

    const newfriendkey = 'D' + Date.now().toString(32);
    db.ref.f[newfriendkey] = { u1: s.id, u2: uid };

    db.save('f','u');
    return {code:200,data:{user:this.getUser(uid, s)}};
  },
  ignoreFriend(uid, s) {
    if(!this.validate(['id'], s).valid) return this.validate.res;
    const udb = db.ref.u[s.id];
    if(!udb) return {code:400};
    if(udb.req?.includes(uid)) db.ref.u[s.id].req = udb.req.filter(key => key !== uid);
    const mdb = db.ref.u[uid];
    if(mdb.req?.includes(s.id)) db.ref.u[uid].req = mdb.req.filter(key => key !== s.id);
    
    db.save('u');
    return {code:200,data:{user:this.getUser(uid,s)}}
  },
  cancelFriend(uid, s) {
    if(!this.validate(['id'], s).valid) return this.validate.res;
    const udb = db.ref.u[s.id];
    if(udb.req?.includes(uid)) db.ref.u[s.id].req = udb.req.filter(key => key !== uid);

    db.save('u');
    return {code:200,data:{user:this.getUser(uid,s)}};
  }
}