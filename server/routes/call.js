const express = require('express');
const { isUser } = require('../js/middlewares');
const hcall = require('../js/handler/hcall');
const router = express.Router();

router.use(isUser);
router.use(express.json({limit: "100KB"}));

router.post('/set', (req, res) => {
  return res.json(hcall.set(req.session.user.id, req.body));
});

router.post('/receive', (req, res) => {
  return res.json(hcall.receive(req.session.user.id, req.body));
});

module.exports = router;