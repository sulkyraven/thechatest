const db = require("./db");

module.exports = {
  validate(requires, snap) {
    if(!snap) return false;
    const valids = requires.filter(s => {
      return Object.keys(snap).find(key => key == s && typeof snap[key] === 'string');
    });
    if(valids.length !== requires.length) return false;
    return true;
  },
  isUser(req, res, next) {
    if(req?.session?.user?.id) {
      if(db.ref.u[req.session.user.id]?.email) return next();
      return res.json({code:403,msg:'UNAUTHORIZED'});
    }
    return res.json({code:403,msg:'UNAUTHORIZED'});
  }
}