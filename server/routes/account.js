const express = require('express');
const { isUser } = require('../js/middlewares');
const haccount = require('../js/handler/haccount');
const router = express.Router();

router.use(isUser);
router.post('/set-img', express.json({limit: "2MB"}), (req, res) => {
  return res.json(haccount.setImage(req.session.user.id, req.body));
});
router.use(express.json({limit:'100kb'}));
router.post('/set-username', (req, res) => {
  return res.json(haccount.setUsername(req.session.user.id, req.body));
});
router.post('/set-bio', (req, res) => {
  return res.json(haccount.setBio(req.session.user.id, req.body));
});
router.post('/set-displayname', (req, res) => {
  return res.json(haccount.setDisplayName(req.session.user.id, req.body));
});

module.exports = router;