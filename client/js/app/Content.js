import modal from "../helper/modal.js";
import db from "../manager/db.js";
import elgen from "../manager/elgen.js";
import userState from "../manager/userState.js";

export default class {
  constructor({ user }) {
    this.user = user;
    this.id = 'content';
    this.isLocked = false;
    this.list = [];
    this.contents = {text:null,img:null,rep:null,file:null};
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('content');
    this.el.innerHTML = `
    <div class="top">
      <div class="left">
        <div class="btn back"><i class="fa-solid fa-arrow-left"></i></div>
        <div class="user">
          <div class="img">
            <img src="${this.user.img?`/img/user/${this.user.id}`:'/assets/user.jpg'}" alt="${this.user.username}" />
          </div>
          <div class="name"><p>@${this.user.username}</p></div>
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
    const chts = db.ref?.chats.find(ch => ch.users.find(k => k.id === this.user.id));

    const ndb = chts.chats || [];
    const odb = this.list;

    const fdb = ndb.filter(ch => !odb.map(och => och.id).includes(ch.id));
    fdb.forEach(ch => {
      this.list.push(ch);
      const card = elgen.contentCard(ch, chts);
      this.chatlist.append(card);
    });
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
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    this.renderChats();
  }
}