const express = require('express');
const { isUser } = require('../js/middlewares');
const hfind = require('../js/handler/hfind');
const router = express.Router();

router.use(isUser, express.json({limit:'100kb'}));

router.get('/search-user', (req, res) => {
  return res.json(hfind.searchUsers(req.session.user.id, req.query?.id || null));
});

module.exports = router;