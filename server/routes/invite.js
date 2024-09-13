const express = require('express');
const hgroup = require('../js/handler/hgroup');
const hfind = require('../js/handler/hfind');
const { isUser } = require('../js/middlewares');
const router = express.Router();

router.get('/g/:id', isUser, (req, res) => {
  const getGroup = hfind.groupInvite(req.session.user.id, req.params.id);
  if(getGroup?.code !== 200) return res.sendStatus(getGroup.code || 404);
  return res.json(getGroup.data || {code:200, msg:'ok'});
});

module.exports = router;