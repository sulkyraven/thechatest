const express = require('express');
const hauth = require('../js/handler/hauth');
const { isUser } = require('../js/middlewares');
const hcloud = require('../js/handler/hcloud');
const router = express.Router();

router.use(express.json({limit:'100kb'}));

router.post('/login', (req, res) => {
  return res.json(hauth.login(req.body));
});

router.post('/verify', (req, res) => {
  const getVerify = hauth.verify(req.body);
  if(getVerify.code === 200) req.session.user = getVerify.data.user;
  return res.json(getVerify);
});

router.get('/isUser', isUser, (req, res) => {
  return res.json({code:200,msg:'ok',data:hcloud.getAll(req.session.user.id)});
});

module.exports = router;