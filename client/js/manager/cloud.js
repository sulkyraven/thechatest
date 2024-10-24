import { Peer } from "https://esm.sh/peerjs@1.5.4?bundle-deps";
import db from "/js/manager/db.js";
import xhr from "/js/helper/xhr.js";
import modal from "/js/helper/modal.js";
import userState from "/js/manager/userState.js";
import { ReceiveCall, currcall } from "/js/app/call/Call.js";

let reqtimeout = null;
const rtime = 7000;

async function waittime(ms = 200) {return new Promise(resolve => setTimeout(resolve, ms))}
// this.peer.socket._socket.send(JSON.stringify({selfadded: {data:"aaw"}}));
class cloud {
  constructor() {
    this.pair = new Map();
    this.isStopped = 0;
  }
  processData(s) {
    if(s.id === 'send-msg') {
      this.peer.socket._socket.send(JSON.stringify({d761: {id:'receivedMsg'}}));
    } else if(s.id === 'read-msg') {
      this.peer.socket._socket.send(JSON.stringify({d761: {id:'receivedMsg'}}));
    }
    /*
    // sabar ya ini masih capekkk
    else if(s.id === 'voice-call') {
      ReceiveCall(s.from);
    } else if(s.id.includes('act-call')) {
      if(currcall) currcall.updateActions(s);
    }
    */
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
    /*
    // aowkwk ini juga belum
    this.peer.on('call', async call => {
      if(currcall) currcall.answerUser(call);
    });
    */
    this.peer.on('error', () => {
      this.forceClose('Timeout: failed to connect to the server',1);
    });
    this.peer.on('disconnected', () => {
      this.forceClose('Disconnected from the server',1);
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
          if(reqtimeout) {
            clearTimeout(reqtimeout);
            reqtimeout = setTimeout(() => this.checkuser(), rtime);
          }
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
  call(peerid, usermedia) {
    const conncall = this.peer.call(peerid, usermedia);
    return conncall;
  }
  async send({id,to,data=null}) {
    if(typeof to === "string") to = [to];
    for(const peer of to) {
      if(!this.pair.has(peer)) await this.connectTo(peer);
      this.pair.get(peer).send({id, from:db.ref.account.id, data});
      await waittime();
    }
  }
  asend(id, data={}) {
    this.peer.socket._socket.send(JSON.stringify({d761: {id,data}}));
  }
  async checkuser() {
    const stillUser = await xhr.get('/auth/stillUser');
    if(!stillUser || stillUser.code !== 200) {
      clearTimeout(reqtimeout);
      return this.forceClose('Connection Error',1);
    }
    if(stillUser.data.peer !== this.peerid) {
      clearTimeout(reqtimeout);
      return this.forceClose('You Are Logged In From Another Location');
    }
  }
  async forceClose(msg='',tp=0) {
    if(!reqtimeout || this.isStopped) return;
    reqtimeout = null;
    this.peer.disconnect();
    this.peer.destroy();
    userState.pmbottom?.el?.remove();
    userState.pmmid?.el?.remove();
    userState.pmtop?.el?.remove();
    document.querySelector('.appname')?.remove();
    document.querySelector('.app .pm').innerHTML = `<p class="doublelogin">${msg}</p>`;
    if(tp) {
      const chooseReconnect = await modal.confirm({ msg, okx: 'Reconnect'});
      if(chooseReconnect) {
        await modal.loading(new Promise(async resolve => {
            window.location.reload();
            self.location.reload();
            location.reload();
            await waittime(1000 * 60);
            resolve();
          }), 'RECONNECTING'
        )
      }
    } else {
      await modal.alert(msg);
    }
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
    reqtimeout = setTimeout(() => this.checkuser(), rtime);
  }
}

export default new cloud();