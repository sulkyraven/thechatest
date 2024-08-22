const db = require("./db");

module.exports = {
  isUser(req, res, next) {
    if(req?.session?.user?.id) {
      if(db.ref.users[req.session.user.id]?.email) return next();
      return res.json({code:400});
    }
    return res.json({code:400});
  }
}