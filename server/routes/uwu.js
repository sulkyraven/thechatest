const express = require('express');
const { isUser } = require('../js/middlewares');
const huwu = require('../js/handler/huwu');
const router = express.Router();

router.use(isUser, express.json({limit:'100kb'}));

router.post('/set-username', (req, res) => {
  return res.json(huwu.setUsername(req.session.user.id, req.body));
});

module.exports = router;