import modal from "../helper/modal.js";
import db from "../manager/db.js";
import elgen from "../manager/elgen.js";
import userState from "../manager/userState.js";
import Content from "./Content.js";
let lang = {};

export default class {
  constructor() {
    this.id = 'chats';
    this.isLocked = false;
    this.list = [];
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('chts');
    this.el.innerHTML = `<div class="card-list"></div>`;
  }
  getChatList() {
    this.cardlist = this.el.querySelector('.card-list');

    const ndb = db.ref?.chats || [];
    const odb = this.list || [];

    const fdb = ndb.filter(ch => !odb.map(och => och.id).includes(ch.id));
    fdb.forEach(ch => {
      this.list.push(ch);
      const user = ch.users.find(k => k.id !== db.ref.account.id);
      const card = elgen.chatCard(user);
      this.cardlist.append(card);
      card.onclick = () => new Content({user, conty:1}).run();
    });
    if(this.list.length < 1) {
      this.cardlist.innerHTML = `<p class="center"><i>${lang.CHTS_NOCHAT}</i></p>`;
    }
  }
  destroy() {
    return new Promise(async resolve => {
      this.el.classList.add('out');
      await modal.waittime();
      this.el.remove();
      this.isLocked = false;
      this.list = [];
      userState.pmmid = null;
      resolve();
    })
  }
  async run() {
    await userState.pmmid?.destroy?.();
    userState.pmmid = this;
    lang = userState.langs[userState.lang];
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    this.getChatList();
  }
}