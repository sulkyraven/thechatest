import modal from "../helper/modal.js";
import sceneIn from "../helper/sceneIn.js";
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
    this.el.classList.add('chts', 'pmm');
    this.el.innerHTML = `<div class="card-list"></div>`;
  }
  getChatList() {
    const cdb = (db.ref.chats || []).sort((a, b) => {
      if(a.chats[a.chats.length - 1].ts < b.chats[b.chats.length - 1].ts) return 1;
      if(a.chats[a.chats.length - 1].ts > b.chats[b.chats.length - 1].ts) return -1;
      return 0;
    });

    this.cardlist = this.el.querySelector('.card-list');
    if(cdb.length < 1) this.cardlist.innerHTML = `<p class="center nomore"><i>${lang.CHTS_NOCHAT}</i></p>`;
    if(cdb.length > 0) this.cardlist.querySelector('.nomore')?.remove();
    cdb.forEach(ch => {
      const user = ch.users.find(k => k.id !== db.ref.account.id);
      const card = elgen.chatCard(user);
      this.cardlist.append(card);
      card.onclick = async() => {
        if(userState.locked.bottom) return;
        userState.locked.bottom = true;
        await userState.pmbottom?.destroy?.();
        new Content({user, conty:1}).run();
        userState.locked.bottom = false;
      }
    })
    /*
    this.cardlist = this.el.querySelector('.card-list');
    const ndb = (db.ref?.chats || []).sort((a, b) => {
      if(a.chats[a.chats.length - 1].ts < b.chats[b.chats.length - 1].ts) return 1;
      if(a.chats[a.chats.length - 1].ts > b.chats[b.chats.length - 1].ts) return -1;
      return 0;
    });
    const odb = this.list || [];

    const fdb = ndb.filter(ch => !odb.map(och => och.id).includes(ch.id));
    fdb.forEach(ch => {
      this.list.push(ch);
      const user = ch.users.find(k => k.id !== db.ref.account.id);
      const card = elgen.chatCard(user);
      this.cardlist.append(card);
      card.onclick = async() => {
        if(userState.locked.bottom) return;
        userState.locked.bottom = true;
        await userState.pmbottom?.destroy?.();
        new Content({user, conty:1}).run();
        userState.locked.bottom = false;
      }
    });
    if(this.list.length < 1) {
      this.cardlist.innerHTML = `<p class="center"><i>${lang.CHTS_NOCHAT}</i></p>`;
    }
    */
  }
  forceUpdate() {
    this.getChatList();
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
    userState.pmmid = this;
    lang = userState.langs[userState.lang];
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    sceneIn(this.el);
    this.getChatList();
  }
}