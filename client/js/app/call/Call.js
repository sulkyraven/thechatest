import modal from "/js/helper/modal.js";
import xhr from "/js/helper/xhr.js";
import { setbadge } from "/js/manager/badge.js";
import db from "/js/manager/db.js";
import userState from "/js/manager/userState.js";
import * as nrw from "/js/manager/nrw.js";
import cloud from "/js/manager/cloud.js";
let lang = {};

let currcall = null;
let repeatSignal = null;
let maxRepeat = null;

class VoiceCall {
  constructor({user}) {
    this.user = user;
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
            <span class="ts">connecting</span>
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
  peerUser() {
    maxRepeat = Date.now() + (1000 * 10);
    repeatSignal = setInterval(() => this.pingUser(), 2000);
  }
  async pingUser() {
    console.log('pinguser');
    const fdb = db.ref.friends?.find(usr => usr.id === this.user.id) || null;
    if(!fdb) {
      clearInterval(repeatSignal);
      repeatSignal = null;
      maxRepeat = null;
      await modal.alert(lang.PROF_ALR_NOFRIEND_1);
      return this.destroy();
    }
    if(fdb.peer) {
      clearInterval(repeatSignal);
      repeatSignal = null;
      maxRepeat = null;
      maxRepeat = Date.now() * (1000 * 10);
      repeatSignal = setInterval(() => this.signalUser(fdb.peer), 2000);
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
  async signalUser(peerid) {
    cloud.send({ "id": "voice-call", "to": peerid });
  }
  destroy() {
    currcall = null;
    this.el.remove();
  }
  run() {
    lang = userState.langs[userState.lang];
    this.createElement();
    document.querySelector('.app').append(this.el);
    this.peerUser();
  }
}

export function checkCall() {
  return currcall ? true : false;
}

export function Call({user}) {
  if(currcall) return;
  new VoiceCall({user}).run();
}