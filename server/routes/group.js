const express = require('express');
const { isUser } = require('../js/middlewares');
const hgroup = require('../js/handler/hgroup');
const router = express.Router();

router.use(isUser);
router.post('/set-img', express.json({limit: "2MB"}), (req, res) => {
  return res.json(hgroup.setImage(req.session.user.id, req.body));
});
router.use(express.json({limit:'100kb'}));
router.post('/set-groupname', (req, res) => {
  return res.json({code:400,msg:'ERROR'});
});

router.post('/create', (req, res) => {
  return res.json(hgroup.create(req.session.user.id, req.body));
});

module.exports = router;