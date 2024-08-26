const db = require("./db");

module.exports = {
  isUser(req, res, next) {
    if(req?.session?.user?.id) {
      if(db.ref.u[req.session.user.id]?.email) return next();
      return res.json({code:403,msg:'UNAUTHORIZED'});
    }
    return res.json({code:403,msg:'UNAUTHORIZED'});
  }
}