import modal from "../helper/modal.js";
import xhr from "../helper/xhr.js";
import db from "../manager/db.js";
import userState from "../manager/userState.js";
import Content from "./Content.js";
let lang = {};

export default class {
  constructor({user}) {
    this.user = user;
    this.isLocked = false;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('prof');
    this.el.innerHTML = `
    <div class="top">
      <div class="btn"><i class="fa-solid fa-arrow-left"></i></div>
      <div class="sect-title">User Detail</div>
    </div>
    <div class="wall">
      <div class="chp displayname"><p></p></div>
      <div class="chp img">
        <img src="${this.user.img?`/img/user/${this.user.id}`:'/assets/user.jpg'}" alt="${this.user.username}"/>
      </div>
      <div class="chp username"><p>@${this.user.username}</p></div>
      <div class="chp bio">
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt soluta velit explicabo temporibus et excepturi. Provident veritatis, sapiente, perferendis explicabo repudiandae quo, perspiciatis tenetur facilis consectetur aperiam culpa magni consequatur!</p>
      </div>
      <div class="chp actions">
        <div class="btn btn-chat"><i class="fa-solid fa-comment-dots"></i><p>Open Chat</p></div>
        <div class="btn btn-call"><i class="fa-solid fa-phone"></i><p>Voice Call</p></div>
        <div class="btn btn-video"><i class="fa-solid fa-video"></i><p>Video Call</p></div>
      </div>
      <div class="chp options">
        <div class="btn sb"><i class="fa-solid fa-user-plus"></i> Add Friend</div>
        <div class="btn sg"><i class="fa-solid fa-user-check"></i> Accept Friend Request</div>
        <div class="btn sr"><i class="fa-solid fa-user-xmark"></i> Ignore Friend Request</div>
        <div class="note sy">Your Friend Request Has Been Sent</div>
        <div class="btn sr"><i class="fa-solid fa-user-xmark"></i> Cancel Friend Request</div>
        <div class="btn sr"><i class="fa-solid fa-user-minus"></i> Unfriend</div>
      </div>
    </div>`;
    const edname = this.el.querySelector('.wall .displayname p');
    edname.innerText = this.user.displayName;
    const ebio = this.el.querySelector('.wall .bio p');
    ebio.innerText = this.user.bio || 'No bio yet.';
  }
  renderActions() {
    this.eloptions = document.querySelector('.chp.options');
    this.eloptions.innerHTML = '';
    if(this.user.isfriend) return this.ActionFriend();
    if(this.user.theirreq) return this.ActionRequest();
    if(this.user.myreq) return this.ActionSent();
    return this.ActionNoFriend();
  }
  async ActionXHR(ref, useconfirm = false, infotext) {
    if(this.isLocked) return;
    this.isLocked = true;

    if(useconfirm) {
      const isconfirm = await modal.confirm(`${lang[infotext].replace('{user}', this.user.username)}`);
      if(!isconfirm) {
        this.isLocked = false;
        return null;
      }
    }

    this.eloptions.innerHTML = `<div class="btn">Loading</div>`;
    const setreq = await xhr.post(`/profile/uwu/${ref}`, {id:this.user.id});
    if(setreq?.code === 200) {
      this.user = setreq.data.user;
    }
    this.isLocked = false;
    return setreq;
  }
  ActionNoFriend() {
    const btn = document.createElement('div');
    btn.classList.add('btn', 'sb');
    btn.innerHTML = `<i class="fa-solid fa-user-plus"></i> ${lang.PROF_ADD}`;
    this.eloptions.append(btn);
    btn.onclick = async() => {
      await this.ActionXHR('addfriend');
      this.renderActions();
    }
  }
  ActionFriend() {
    const btn = document.createElement('div');
    btn.classList.add('btn', 'sr');
    btn.innerHTML = `<i class="fa-solid fa-user-minus"></i> ${lang.PROF_UNFRIEND}`;
    this.eloptions.append(btn);
    btn.onclick = async() => {
      await this.ActionXHR('unfriend', true, 'PROF_CONF_UNFRIEND');
      this.renderActions();
    }
  }
  ActionRequest() {
    const btn_a = document.createElement('div');
    btn_a.classList.add('btn', 'sg');
    btn_a.innerHTML = `<i class="fa-solid fa-user-check"></i> ${lang.PROF_ACCEPT}`;
    const btn_b = document.createElement('div');
    btn_b.classList.add('btn', 'sr');
    btn_b.innerHTML = `<i class="fa-solid fa-user-xmark"></i> ${lang.PROF_IGNORE}`;

    this.eloptions.append(btn_a, btn_b);
    btn_a.onclick = async() => {
      await this.ActionXHR('acceptfriend');
      this.renderActions();
    }
    btn_b.onclick = async() => {
      await this.ActionXHR('ignorefriend', true, 'PROF_CONF_IGNORE');
      this.renderActions();
    }
  }
  ActionSent() {
    this.eloptions.innerHTML = `<div class="note sy">${lang.PROF_WAIT}</div>`;
    const btn = document.createElement('div');
    btn.classList.add('btn', 'sr');
    btn.innerHTML = `<i class="fa-solid fa-user-xmark"></i> ${lang.PROF_CANCEL}`;
    this.eloptions.append(btn);
    btn.onclick = async() => {
      await this.ActionXHR('cancelfriend', true, 'PROF_CONF_CANCEL');
      this.renderActions();
    }
  }
  btnListener() {
    const btnChat = this.el.querySelector('.actions .btn-chat');
    btnChat.onclick = () => new Content({user:this.user,conty:1}).run();
    const btnCall = this.el.querySelector('.actions .btn-call');
    const btnVideo = this.el.querySelector('.actions .btn-video');
  }
  destroy() {
    return new Promise(async resolve => {
      this.el.classList.add('out');
      await modal.waittime();
      this.el.remove();
      this.isLocked = false;
      userState.pmbottom = null;
      resolve();
    });
  }
  async run() {
    lang = userState.langs[userState.lang];
    await userState.pmbottom?.destroy?.();
    userState.pmbottom = this;
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    this.renderActions();
    this.btnListener();
  }
}