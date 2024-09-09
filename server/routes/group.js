const express = require('express');
const { isUser } = require('../js/middlewares');
const hgroup = require('../js/handler/hgroup');
const router = express.Router();

router.use(isUser);
router.post('/set-img', express.json({limit: "2MB"}), (req, res) => {
  return res.json(hgroup.setImage(req.session.user.id, req.body));
});
router.use(express.json({limit:'100kb'}));
router.post('/create', (req, res) => {
  return res.json(hgroup.create(req.session.user.id, req.body));
});
router.post('/set-groupname', (req, res) => {
  return res.json(hgroup.setGname(req.session.user.id, req.body));
});
router.post('/set-type', (req, res) => {
  return res.json(hgroup.setType(req.session.user.id, req.body));
});
router.post('/del-group', (req, res) => {
  return res.json(hgroup.delGroup(req.session.user.id, req.body));
});
module.exports = router;