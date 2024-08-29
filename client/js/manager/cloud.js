import { Peer } from "https://esm.sh/peerjs@1.5.4?bundle-deps";
import db from "./db.js";
import xhr from "../helper/xhr.js";

async function waittime(ms = 200) {return new Promise(resolve => setTimeout(resolve, ms))}
// this.peer.socket._socket.send(JSON.stringify({selfadded: {data:"aaw"}}));
class cloud {
  constructor() {
    this.pair = new Map();
  }
  processData(data) {
  }
  clientData(obj) {
    if(!['peers'].includes(obj.name)) {
      db.ref[obj.name] = obj.data;
    }

    if(['chats'].includes(obj.name)) {
      obj.data.forEach(ch => {
        ch.users.forEach(k => {
          if(k.peer) {
            if(!db.peer.get(k.id)) db.peer.set(k.id, k.peer);
            if(!this.pair.get(k.peer)) this.connectTo([k.peer]);
          }
        });
      });
    }
    if(['friends'].includes(obj.name)) {
      if(obj.data.peer) {
        if(!db.peer.get(obj.data.id)) db.peer.set(obj.data.id, obj.data.peer);
        if(!this.pair.get(obj.data.peer)) this.connectTo([obj.data.peer]);
      }
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