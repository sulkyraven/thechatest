import modal from "../helper/modal.js";
import db from "../manager/db.js";
import elgen from "../manager/elgen.js";
import userState from "../manager/userState.js";
import Account from "./Account.js";

export default class {
  constructor() {
    this.id = 'chats';
    this.isLocked = false;
    this.list = [];
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('chts');
    this.el.innerHTML = `
    <div class="top">
      <div class="title">KIRIMIN</div>
      <div class="actions">
        <div class="btn"><i class="fa-solid fa-magnifying-glass"></i></div>
        <div class="btn btn-settings"><i class="fa-solid fa-gear"></i></div>
      </div>
    </div>
    <div class="bottom">
      <div class="card-list">
        <div class="card">
          <div class="left">
            <div class="img">
              <img src="./assets/user.jpg" alt="user" width="50"/>
            </div>
            <div class="detail">
              <div class="name"><p>Devanka</p></div>
              <div class="last">Aowkwk</div>
            </div>
          </div>
          <div class="right">
            <div class="last">11/12/24</div>
            <div class="unread"><div class="circle">7</div></div>
          </div>
        </div>
      </div>
    </div>`;
  }
  getChatList() {
    this.cardlist = this.el.querySelector('.card-list');

    const ndb = db.ref?.chts || [];
    const odb = this.list || [];

    const fdb = ndb.filter(ch => !odb.map(ch => ch.id).includes(ch.id));
    fdb.forEach(ch => {
      const card = elgen.contentCard(ch);
      this.cardlist.append(card);
    });
  }
  btnListener() {
    const btnSettings = this.el.querySelector('.btn-settings');
    btnSettings.onclick = async() => {
      await userState.pmbottom?.destroy?.();
      new Account().run();
    }
  }
  destroy() {
    return new Promise(async resolve => {
      this.el.classList.add('out');
      await modal.waittime();
      this.el.remove();
      this.isLocked = false;
      userState.pmmid = null;
      resolve();
    })
  }
  async run() {
    await userState.pmmid?.destroy?.();
    userState.pmmid = this;
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    this.btnListener();
  }
}