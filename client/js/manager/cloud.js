import { Peer } from "https://esm.sh/peerjs@1.5.4?bundle-deps";
import db from "./db.js";
import xhr from "../helper/xhr.js";

async function waittime(ms = 200) {return new Promise(resolve => setTimeout(resolve, ms))}

class cloud {
  constructor() {
    this.pair = new Map();
  }
  processData(data) {
    console.log(data);
  }
  clientData(obj) {
    if(!['peers'].includes(obj.name)) {
      db.ref[obj.name] = obj.data;
    }

    if(['chats', 'friends'].includes(obj.name)) {
      if(!db.peer.get(obj.data.userid)) db.peer.set(obj.data.userid, obj.data.peerid);
      if(!this.pair.get(obj.data.peerid)) this.connectTo([obj.data.peerid]);
    }
  }
  listenTo() {
    this.peer.on('connection', (conn) => {
      conn.on('open', () => {
        this.pair.set(conn.peer, conn);
      });
      conn.on('data', (data) => this.processData(data));

      window.addEventListener('unload', () => conn.close());
    });

    this.peer.once('open', () => {
      this.peer.socket._socket.addEventListener("message", (msg) => {
        if(msg.data) this.clientData(JSON.parse(msg.data));
      });
    });
  }
  async connectTo({ otherpeers }) {
    for (const id of otherpeers) {
      const conn = this.peer.connect(id);

      conn.on('open', () => {
        this.pair.set(conn.peer, conn);
      });

      conn.on('data', (data) => this.processData(data));

      window.addEventListener('unload', () => conn.close());

      await waittime(200);
    }
  }
  async send({type,to,data=null}) {
    if(typeof to === 'string') to = [to];
    for(const uid of to) {
      let peerid = db.peer.get(uid);
      if(peerid) this.pair.get(peerid).send({type,data,from:db.ref.account.id});
    }
  }
  async run({ peerKey, peerid, otherpeers }) {
    this.peer = new Peer(peerid, {
      host: window.location.hostname,
      key: peerKey,
      port: window.location.port,
      path: 'cloud',
    });
    this.listenTo();
    this.connectTo({ otherpeers });
  }
}

export default new cloud();