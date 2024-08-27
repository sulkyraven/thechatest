const express = require('express');
const { isUser } = require('../js/middlewares');
const hprofile = require('../js/handler/hprofile');
const router = express.Router();

router.use(isUser, express.json({limit:'100kb'}));

router.post('/addfriend', (req, res) => {
  return res.json(hprofile.addFriend(req.session.user.id, req.body));
});
router.post('/unfriend', (req, res) => {
  return res.json(hprofile.unFriend(req.session.user.id, req.body));
});
router.post('/acceptfriend', (req, res) => {
  return res.json(hprofile.acceptFriend(req.session.user.id, req.body));
});
router.post('/ignorefriend', (req, res) => {
  return res.json(hprofile.ignoreFriend(req.session.user.id, req.body));
});
router.post('/cancelfriend', (req, res) => {
  return res.json(hprofile.cancelFriend(req.session.user.id, req.body));
});

module.exports = router;