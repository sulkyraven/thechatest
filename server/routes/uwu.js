const express = require('express');
const { isUser } = require('../js/middlewares');
const huwu = require('../js/handler/huwu');
const router = express.Router();

router.post('/set-img', express.json({limit: "2MB"}), (req, res) => {
  return res.json(huwu.setImage(req.session.user.id, req.body));
});

router.use(isUser, express.json({limit:'100kb'}));
router.post('/set-username', (req, res) => {
  return res.json(huwu.setUsername(req.session.user.id, req.body));
});
router.post('/set-bio', (req, res) => {
  return res.json(huwu.setBio(req.session.user.id, req.body));
});
router.post('/set-displayname', (req, res) => {
  return res.json(huwu.setDisplayName(req.session.user.id, req.body));
});

module.exports = router;