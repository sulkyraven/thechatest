import modal from "../helper/modal.js";
import sceneIn from "../helper/sceneIn.js";
import db from "../manager/db.js";
import elgen from "../manager/elgen.js";
import userState from "../manager/userState.js";
import GroupSetting from "./GroupSetting.js";
import Profile from "./Profile.js";

export default class {
  constructor({ user, conty }) {
    this.conty = conty;
    this.user = user;
    this.id = 'content';
    this.isLocked = false;
    this.list = [];
    this.contents = {text:null,img:null,rep:null,file:null};
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('content', 'pmb');
    this.el.innerHTML = `
    <div class="top">
      <div class="left">
        <div class="btn back"><i class="fa-solid fa-arrow-left"></i></div>
        <div class="user">
          <div class="img">
            <img src="${this.user.img}" alt="${this.user.username}" />
          </div>
          <div class="name"><p>${this.user.username}</p></div>
        </div>
      </div>
      <div class="right">
        <div class="btn">
          <i class="fa-solid fa-video"></i>
        </div>
        <div class="btn">
          <i class="fa-solid fa-phone"></i>
        </div>
        <div class="btn">
          <i class="fa-solid fa-ellipsis-vertical"></i>
        </div>
      </div>
    </div>
    <div class="mid">
      <div class="chats"></div>
    </div>
    <div class="bottom">
      <div class="field">
        <div class="input">
          <div class="emoji">
            <div class="btn btn-emoji">
              <i class="fa-solid fa-face-smile"></i>
            </div>
          </div>
          <div class="textbox">
            <textarea name="content-input" id="content-input" placeholder="Type Here"></textarea>
          </div>
          <div class="actions">
            <div class="btn btn-attach">
              <i class="fa-solid fa-paperclip"></i>
            </div>
            <div class="btn btn-image">
              <i class="fa-solid fa-camera-retro"></i>
            </div>
          </div>
        </div>
        <div class="voice">
          <div class="btn btn-voice">
            <i class="fa-solid fa-microphone"></i>
          </div>
        </div>
      </div>
    </div>`;
    this.chatlist = this.el.querySelector('.mid .chats');
  }
  renderChats() {
    const csu = chatSelection(this.user, this.conty);
    Object.keys(csu).forEach(k => this.user[k] = csu[k]);
    const eluname = this.el.querySelector('.top .left .user .name');
    eluname.innerText = this.user.username;
    if(!this.user.db) return;
    const chts = this.user.db;

    if(!chts) return;
    const ndb = chts.chats || [];
    const odb = this.list;

    const fdb = ndb.filter(ch => !odb.map(och => och.id).includes(ch.id));
    fdb.forEach(ch => {
      this.list.push(ch);
      const card = elgen.contentCard(ch, chts, this.conty);
      this.chatlist.append(card);
    });
  }
  btnListener() {
    const eluser = document.querySelector('.top .left .user');
    eluser.onclick = () => this.user.prof.run();
  }
  formListener() {
    const inpMsg = this.el.querySelector('#content-input');
    this.btnSend = this.el.querySelector('.btn-voice');
    this.btnSend.onclick = async() => {}
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
    await userState.pmbottom?.destroy?.();
    userState.pmbottom = this;
    this.user.img = imageSelection(this.user, this.conty);
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    sceneIn(this.el);
    this.btnListener();
    this.renderChats();
  }
}

function chatSelection(obj, conty) {
  if(conty === 1) return {
    id: obj.id,
    username: obj.username,
    db: db.ref.chats?.find(ch => ch.users.find(k => k.id === obj.id)),
    prof: new Profile({user:obj}),
  }
  if(conty === 2) return {
    id: obj.id,
    username: obj.n,
    db: db.ref.groups?.find(ch => ch.id === obj.id),
    prof: new GroupSetting({group:obj}),
  }
}
function imageSelection(obj, conty) {
  if(conty === 1) return obj.img ? `/img/user/${obj.id}` : '/assets/user.jpg';
  if(conty === 2) return obj.i ? `/img/group/${obj.id}` : '/assets/group.jpg';
}