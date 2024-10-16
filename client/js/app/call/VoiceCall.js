import modal from "/js/helper/modal.js";
import xhr from "/js/helper/xhr.js";
import { setbadge } from "/js/manager/badge.js";
import db from "/js/manager/db.js";
import userState from "/js/manager/userState.js";
import cloud from "/js/manager/cloud.js";
let lang = {};

let repeatSignal = null;
let maxRepeat = null;
let tsTick = {
  loop: null,
  start: null
}

let mediaStream = null;

function tsCount(el) {
  tsTick.start = Date.now();

  tsTick.loop = setInterval(() => {
    const elapsedTime = Date.now() - tsTick.start;
    let jj = Math.floor(elapsedTime / (1000 * 60 * 60));
    let mm = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
    let dd = Math.floor((elapsedTime % (1000 * 60)) / 1000);

    mm = jj > 0 ? String(mm).padStart(2, '0') : mm;
    dd = String(dd).padStart(2, '0');
    el.innerHTML = `${jj>0?jj+':':''}${mm}:${dd}`;
  }, 1000);
}
function tsStop() {
  if(tsTick.loop) {
    clearInterval(tsTick.loop);
    tsTick.loop = null;
  }
  if(tsTick.start) tsTick.start = null;
}

export default class VoiceCall {
  constructor({callman, user}) {
    this.callman = callman;
    this.user = user;
    this.call = null;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('call');
    this.el.innerHTML = `
    <div class="background">
      <div class="profpic">
        <img src="./assets/user.jpg" alt="user"/>
      </div>
    </div>
    <div class="top">
      <div class="detail">
        <div class="btn btn-minimize"><i class="fa-solid fa-chevron-down fa-fw"></i></div>
        <div class="caller">
          <div class="displayname"></div>
          <div class="user">
            <span class="username"></span>
            <span class="ts">preparing</span>
          </div>
        </div>
      </div>
      <div class="act-info">
        <div class="card">
          <i class="fa-duotone fa-microphone-slash"></i> <span>username muted</span>
        </div>
        <div class="card">
          <i class="fa-duotone fa-volume-slash"></i> <span>username deafen</span>
        </div>
      </div>
    </div>
    <div class="bottom">
      <div class="act-list">
        <div class="call-act">
          <div class="btn btn-deafen">
            <i class="fa-solid fa-volume fa-fw"></i>
          </div>
          <div class="btn btn-mute">
            <i class="fa-solid fa-microphone fa-fw"></i>
          </div>
          <div class="btn btn-video">
            <i class="fa-solid fa-video fa-fw"></i>
          </div>
        </div>
        <div class="call-act">
          <div class="btn btn-hangup">
            <i class="fa-solid fa-phone-hangup fa-fw"></i>
          </div>
        </div>
      </div>
    </div>`;
    this.estatus = this.el.querySelector('.top .detail .caller .user .ts');
    const edname = this.el.querySelector('.top .detail .displayname');
    edname.append(this.user.displayName);
    const euname = this.el.querySelector('.top .detail .user .username');
    euname.append('@' + this.user.username);
    if(this.user.b) {
      for(const badge of this.user.b.sort((a,b) => b - a)) {
        edname.append(setbadge(badge));
      }
    }
  }
  btnListener() {
    const btnHangup = this.el.querySelector('.btn-hangup');
    btnHangup.onclick = () => this.actionHangup();
  }
  actionHangup() {
    if(mediaStream) {
      mediaStream.pause();
      mediaStream.remove();
      mediaStream = null;
    }
    if(this.call) {
      this.call.close();
      this.call = null;
    }
    this.destroy();
  }
  async pingUser() {
    const fdb = db.ref.friends?.find(usr => usr.id === this.user.id) || null;
    if(!fdb) {
      clearInterval(repeatSignal);
      repeatSignal = null;
      maxRepeat = null;
      await modal.alert(lang.PROF_ALR_NOFRIEND_1);
      return this.destroy();
    }
    if(fdb.peer) {
      this.user.peer = fdb.peer;
      this.estatus.innerHTML = 'ringing';
      clearInterval(repeatSignal);
      repeatSignal = null;
      maxRepeat = null;
      maxRepeat = Date.now() + (1000 * 10);
      repeatSignal = setInterval(() => this.signalUser(fdb.peer), 1000);
      return;
    }
    if(Date.now() > maxRepeat) {
      clearInterval(repeatSignal);
      repeatSignal = null;
      maxRepeat = null;
      await modal.alert('lang.CALL_MAX_PING_TRIES_LIMIT');
      return this.destroy();
    }
  }
  async callUser() {
    const umedia = await userMedia();
    if(!umedia) return this.destroy();
    await modal.waittime(249);
    console.log(this.user.peer);
    const call = cloud.call(this.user.peer, umedia);
    call.on('stream', (remoteStream) => this.streamNow(remoteStream));
    call.on('close', () => this.actionHangup());
    this.call = call;
  }
  async answerUser(call) {
    const umedia = await userMedia();
    if(!umedia) return this.destroy();
    call.answer(umedia);
    call.on('stream', (remoteStream) => this.streamNow(remoteStream));
    call.on('close', () => this.actionHangup());
    this.call = call;
  }
  async streamNow(remoteStream) {
    if(!tsTick.loop && !tsTick.start) tsCount(this.estatus);
    mediaStream = new Audio();
    mediaStream.srcObject = remoteStream;
    mediaStream.play();
  }
  async signalUser(peerid) {
    const vdb = db.ref.vcall || null;
    if(vdb && vdb.u?.[this.user.id]?.j && vdb.u?.[db.ref.account.id]?.j) {
      clearInterval(repeatSignal);
      repeatSignal = null;
      maxRepeat = null;
      this.estatus.innerHTML = 'connecting';
      return this.callUser();
      // return this.streamNow();
    }
    cloud.send({ "id": "voice-call", "to": peerid });
    cloud.asend('voiceCall', {id:this.user.id});
    if(Date.now() > maxRepeat) {
      clearInterval(repeatSignal);
      repeatSignal = null;
      maxRepeat = null;
      return this.destroy();
    }
  }
  async follow() {
    this.init();
    const updateCall = await xhr.post('/call/uwu/receive', {id:this.user.id});
    if(updateCall?.code !== 200) {
      await modal.alert(lang[updateCall.msg] || lang.ERROR);
      return this.destroy();
    }
    this.estatus.innerHTML = 'connecting';
  }
  async run() {
    this.init();
    const setCall = await xhr.post('/call/uwu/set', {id:this.user.id});
    if(setCall?.code !== 200) {
      await modal.alert(lang[setCall.msg] || lang.ERROR);
      return this.destroy();
    }
    this.estatus.innerHTML = 'calling';
    maxRepeat = Date.now() + (1000 * 10);
    repeatSignal = setInterval(() => this.pingUser(), 1000);
  }
  destroy() {
    this.callman(null);
    this.el.remove();
  }
  init() {
    this.callman(this);
    lang = userState.langs[userState.lang];
    this.createElement();
    document.querySelector('.app').append(this.el);
    this.btnListener();
  }
}

function userMedia(n = false) {
  return new Promise(resolve => {
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return resolve(null);
    navigator.mediaDevices.getUserMedia({audio:true,video:n}).then(stream => {
      return resolve(stream);
    }).catch(err => {
      console.log(err);
      return resolve(null);
    })
  });
}