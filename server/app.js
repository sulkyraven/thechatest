process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const app = express();
const authRouter = require('./routes/auth');
const imgRouter = require('./routes/img');
const accountRouter = require('./routes/account');
const profileRouter = require('./routes/profile');
const findRouter = require('./routes/find');
const { ExpressPeerServer } = require('peer');
const { peerKey } = require('./js/helper');
const db = require('./js/db');

const fs = require('fs');
if(!fs.existsSync('./server/sessions')) {
  fs.mkdirSync('./server/sessions');
  fs.writeFileSync('./server/sessions/df.txt', '', 'utf-8');
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
app.use('/img', imgRouter);
app.use('/account/uwu', accountRouter);
app.use('/find/uwu', findRouter);
app.use('/profile/uwu', profileRouter);

app.get('/app', (req, res) => {
  return res.render('app');
});

app.get('/', (req, res) => {
  return res.json({code:200,msg:"ok"});
});

const appservice = app.listen(Number(process.env.APP_PORT), () => {
  console.log(`ONLINE NOW >> http://${process.env.APP_HOST}:${process.env.APP_PORT}/app`);
});

const server = ExpressPeerServer(appservice, {
  key: peerKey,
  allow_discovery: true
});

server.on('connection', (c) => {
  db.ref.x.push(c.getId());
});
server.on('disconnect', (c) => {
  const offuser = Object.keys(db.ref.u).find(k => db.ref.u[k]?.peer === c.getId());
  if(offuser) delete db.ref.u[offuser].peer;
  db.ref.x = db.ref.x.filter(peerid => peerid !== c.getId());
  db.save('u');
});
server.on('error', console.error);

app.use('/cloud', server);

app.use('/', async(req, res) => {
  res.sendStatus(404);
});