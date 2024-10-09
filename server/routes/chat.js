const express = require('express');
const { isUser } = require('../js/middlewares');
const hchat = require('../js/handler/hchat');
const router = express.Router();

router.use(isUser);
router.use(express.json({limit: "10MB"}));

router.post('/sendMessage', (req, res) => {
  return res.json(hchat.sendMessage(req.session.user.id, req.body));
});

router.post('/deleteMessage', (req, res) => {
  return res.json(hchat.delMessage(req.session.user.id, req.body));
});

module.exports = router;