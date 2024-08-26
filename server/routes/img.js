const express = require('express');
const { isUser } = require('../js/middlewares');
const himg = require('../js/handler/himg');
const router = express.Router();

router.get('/user/:profile', isUser, (req, res) => {
  const file = himg.user(req.params.profile);
  if(file?.code !== 200) return res.sendStatus(404);
  return res.sendFile(file.data.name, {root: './'});
});

router.get('/', (req, res) => {
  return res.sendStatus(403);
});

module.exports = router;