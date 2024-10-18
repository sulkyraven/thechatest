process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const app = express();
const authRouter = require('./routes/auth');
const fileRouter = require('./routes/file');
const accountRouter = require('./routes/account');
const profileRouter = require('./routes/profile');
const findRouter = require('./routes/find');
const groupRouter = require('./routes/group');
const chatRouter = require('./routes/chat');
const callRouter = require('./routes/call');
const inviteRouter = require('./routes/invite');
const { ExpressPeerServer } = require('peer');
const { peerKey } = require('./js/helper');
const db = require('./js/db');

const fs = require('fs');
const hcloud = require('./js/handler/hcloud');
const hsocket = require('./js/handler/hsocket');
if(!fs.existsSync('./server/sessions')) {
  fs.mkdirSync('./server/sessions');
  console.log('sessions reloaded!');
}

db.load();
db.ref.x = [];

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7, sameSite: 'strict' },
  store: new FileStore({ path: './server/sessions', logFn() {} })
}));

app.use(express.static('client'));
app.set('view engine', 'ejs')

app.use('/auth', authRouter);
app.use('/file', fileRouter);
app.use('/account/uwu', accountRouter);
app.use('/find/uwu', findRouter);
app.use('/profile/uwu', profileRouter);
app.use('/group/uwu', groupRouter);
app.use('/chat/uwu', chatRouter);
app.use('/call/uwu', callRouter);
app.use('/invite', inviteRouter);

app.get('/app', (req, res) => {
  return res.render('app');
});

app.get('/', (req, res) => {
  return res.json({code:200,msg:"ok"});
});

const appservice = app.listen(Number(process.env.APP_PORT), () => {
  console.log(`ONLINE NOW >> http://${process.env.APP_HOST}:${process.env.APP_PORT}/app`);
  console.log(`PEERS >> http://${process.env.APP_HOST}:${process.env.APP_PORT}/cloud/${peerKey}/peers`);
});

const server = ExpressPeerServer(appservice, {
  key: peerKey,
  allow_discovery: true
});

server.on('message', (c, m) => {
  const udb = db.ref.u;
  const uid = Object.keys(udb).find(key => udb[key].peer === c.getId());
  if(!uid) return;
  if(m.d761) {
    const socketHandler = hsocket.run(uid, m.d761);
    if(!socketHandler) return;
    return c.send(socketHandler);
  }
  if(m.type === 'HEARTBEAT') return c.send({data:hcloud.getAll(uid)});
});
// server.on('connection', (c) => {
//   console.log('connected', c.getId());
// });
server.on('disconnect', (c) => {
  // console.log('disconnected', c.getId());
  const offuser = Object.keys(db.ref.u).find(k => db.ref.u[k]?.peer === c.getId());
  if(offuser) delete db.ref.u[offuser].peer;
  db.save('u');
});
server.on('error', console.error);

app.use('/cloud', server);

app.use('/', async(req, res) => {
  res.sendStatus(404);
});