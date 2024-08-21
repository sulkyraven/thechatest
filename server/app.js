process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const { ExpressPeerServer } = require('peer');
const { peerKey } = require('./js/helper');
const app = express();
const db = require('./js/db');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
  store: new FileStore({ path: './server/sessions', logFn() {} })
}));

app.use(express.static('client'));
app.set('view engine', 'ejs')

app.get('/app', (req, res) => {
  return res.render('app');
});

app.get('/', (req, res) => {
  return res.json({code:200,msg:"ok"});
});

app.use('/', (req, res) => {
  res.sendStatus(404);
});

const appservice = app.listen(Number(process.env.APP_PORT), () => {
  console.log(`ONLINE NOW >> http://${process.env.APP_HOST}:${process.env.APP_PORT}/app`);
});

const server = ExpressPeerServer(appservice, {
  key: peerKey,
  allow_discovery: true
});

server.on('disconnect', (c) => console.log('disconnected:', c.getId()));
server.on('connection', (c) => console.log('connected:', c.getId()));
server.on('error', console.error);

app.use('/cloud', server);