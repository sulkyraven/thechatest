import { Peer } from "https://esm.sh/peerjs@1.5.4?bundle-deps";
import db from "/js/manager/db.js";
import xhr from "/js/helper/xhr.js";
import userState from "/js/manager/userState.js";
import { ReceiveCall, currcall } from "/js/app/call/Call.js";

async function waittime(ms = 200) {return new Promise(resolve => setTimeout(resolve, ms))}
// this.peer.socket._socket.send(JSON.stringify({selfadded: {data:"aaw"}}));
class cloud {
  constructor() {
    this.pair = new Map();
  }
  processData(s) {
    if(s.id === 'send-msg') {
      this.peer.socket._socket.send(JSON.stringify({d761: {id:'receivedMsg'}}));
    } else if(s.id === 'read-msg') {
      this.peer.socket._socket.send(JSON.stringify({d761: {id:'receivedMsg'}}));
    } else if(s.id === 'voice-call') {
      ReceiveCall(s.from);
    } else if(s.id.includes('act-call')) {
      if(currcall) currcall.updateActions(s);
    }
  }
  clientData(obj) {
    if(obj.code && obj.code !== 200) return;
    
    if(!['peersinit', 'peers'].includes(obj.name)) {
      db.ref[obj.name] = obj.data;
    }

    // if(['chats'].includes(obj.name)) {
    //   obj.data.forEach(ch => {
    //     ch.users.forEach(k => {
    //       if(k.peer) {
    //         if(!db.peer.get(k.id)) db.peer.set(k.id, k.peer);
    //         if(!this.pair.get(k.peer)) this.connectTo([k.peer]);
    //       }
    //     });
    //   });
    // }
    // if(['friends'].includes(obj.name)) {
    //   if(obj.data.peer) {
    //     if(!db.peer.get(obj.data.id)) db.peer.set(obj.data.id, obj.data.peer);
    //     if(!this.pair.get(obj.data.peer)) this.connectTo([obj.data.peer]);
    //   }
    // }
  }
  listenTo() {
    this.peer.on('call', async call => {
      if(currcall) currcall.answerUser(call);
    });

    this.peer.on('connection', (conn) => {
      conn.on('open', () => {
        console.info('connected_a', conn.peer);
        this.pair.set(conn.peer, conn);
        this.peer.socket._socket.send(JSON.stringify({d761:{id:"getTalks"}}));
      });
      conn.on('close', () => {
        console.info('disconnected_a', conn.peer);
        this.pair.delete(conn.peer);
      });
      conn.on('error', () => {
        console.error('error_a', conn.peer);
      });
      conn.on('data', (data) => this.processData(data));

      window.addEventListener('unload', () => conn.close());
    });

    this.peer.once('open', () => {
      this.peer.socket._socket.addEventListener("message", (msg) => {
        if(msg.data) {
          JSON.parse(msg.data)?.data?.forEach(obj => this.clientData(obj));
          userState.pmbottom?.forceUpdate?.();
          userState.pmmid?.forceUpdate?.();
        }
      });
    });
  }
  connectTo(id) {
    return new Promise(async resolve => {
      const conn = this.peer.connect(id);

      conn.on('open', () => {
        console.info('connected_b', conn.peer);
        this.pair.set(conn.peer, conn);
        resolve();
      });
      conn.on('close', () => {
        console.info('disconnected_b', conn.peer);
        this.pair.delete(conn.peer);
      });
      conn.on('error', () => {
        console.error('error_b', conn.peer);
      });

      conn.on('data', (data) => this.processData(data));

      window.addEventListener('unload', () => conn.close());
    });
  }
  async oldconnectTo({ key = null, peers = null } = {}) {
    if(!peers) peers = await this.allPeers(key);
    for (const peer of peers) {
      const conn = this.peer.connect(peer);

      conn.on('open', () => {
        console.info('connected_b', conn.peer);
        this.pair.set(conn.peer, conn);
      });
      conn.on('close', () => {
        console.info('disconnected_b', conn.peer);
        this.pair.delete(conn.peer);
      });
      conn.on('error', () => {
        console.error('error_b', conn.peer);
      });

      conn.on('data', (data) => this.processData(data));

      window.addEventListener('unload', () => conn.close());

      await waittime(200);
    }
  }
  async allPeers(key) {
    const url = `${window.location.origin}/cloud/${key}/peers`;
    const response = await fetch(url);
    const peersArray = await response.json();
    const list = peersArray ?? [];
    return list.filter((id) => id !== this.peerid);
  }
  call(peerid, usermedia) {
    const conncall = this.peer.call(peerid, usermedia);
    return conncall;
  }
  async send({id,to,data=null}) {
    if(typeof to === "string") to = [to];
    for(const peer of to) {
      if(!this.pair.has(peer)) await this.connectTo(peer);
      this.pair.get(peer).send({id, from:db.ref.account.id, data});
    }
  }
  asend(id, data={}) {
    this.peer.socket._socket.send(JSON.stringify({d761: {id,data}}));
  }
  async run({ peerKey, peerid }) {
    this.peerid = peerid;
    this.peer = new Peer(peerid, {
      host: window.location.hostname,
      key: peerKey,
      port: window.location.port,
      path: 'cloud',
    });
    this.listenTo();
    const url = `${window.location.origin}/cloud/${peerKey}/peers`;

    const response = await fetch(url);
    const peersArray = await response.json();
    const list = peersArray ?? [];
    const peers = list.filter((id) => id !== peerid);

    for(const id of peers) {
      this.connectTo(id);
      await waittime(200);
    }
  }
}

export default new cloud();