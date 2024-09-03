const express = require('express');
const { isUser } = require('../js/middlewares');
const himg = require('../js/handler/himg');
const router = express.Router();

router.get('/group/:id', isUser, (req, res) => {
  const file = himg.group(req.params.id);
  if(file?.code !== 200) return res.sendStatus(404);
  return res.sendFile(file.data.name, {root: './'});
});

router.get('/user/:id', isUser, (req, res) => {
  const file = himg.user(req.params.id);
  if(file?.code !== 200) return res.sendStatus(404);
  return res.sendFile(file.data.name, {root: './'});
});

router.get('/', (req, res) => {
  return res.sendStatus(403);
});

module.exports = router;