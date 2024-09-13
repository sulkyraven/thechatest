const express = require('express');
const { isUser } = require('../js/middlewares');
const hfile = require('../js/handler/hfile');
const router = express.Router();

router.get('/content/:id/:name', isUser, (req, res) => {
  const file = hfile.content(req.session.user.id, {id:req.params.id, name:req.params.name});
  if(file?.code !== 200) return res.sendStatus(file?.code || 404);
  return res.sendFile(file.data.name, {root: './'});
});

router.get('/group/:id', isUser, (req, res) => {
  const file = hfile.group(req.params.id);
  if(file?.code !== 200) return res.sendStatus(404);
  return res.sendFile(file.data.name, {root: './'});
});

router.get('/user/:id', isUser, (req, res) => {
  const file = hfile.user(req.params.id);
  if(file?.code !== 200) return res.sendStatus(404);
  return res.sendFile(file.data.name, {root: './'});
});

router.get('/', (req, res) => {
  return res.sendStatus(403);
});

module.exports = router;