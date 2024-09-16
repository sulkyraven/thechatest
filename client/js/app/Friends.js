import modal from "../helper/modal.js";
import sceneIn from "../helper/sceneIn.js";
import db from "../manager/db.js";
import elgen from "../manager/elgen.js";
import userState from "../manager/userState.js";
import Profile from "./Profile.js";
let lang = {};

export default class {
  constructor() {
    this.id = 'friends';
    this.isLocked = false;
    this.list = [];
    this.reqlist = [];
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('chts', 'pmm');
    this.el.innerHTML = `<div class="card-list"></div>`;
  }
  getFriendlist() {
    this.cardlist = this.el.querySelector('.card-list');

    const ndb = db.ref?.friends || [];
    const odb = this.list || [];

    const fdb = ndb.filter(ch => !odb.map(och => och.id).includes(ch.id));
    fdb.forEach(ch => {
      this.list.push(ch);
      const card = elgen.friendCard(ch);
      this.cardlist.append(card);
      card.onclick = async() => {
        if(userState.locked.bottom) return;
        userState.locked.bottom = true;
        await userState.pmbottom?.destroy?.();
        new Profile({user:ch}).run();
        userState.locked.bottom = false;
      }
    });
    if(this.list.length < 1) {
      this.cardlist.innerHTML = `<p class="center"><i>${lang.CHTS_NOCHAT}</i></p>`;
    }
  }
  getReqList() {
    const ndb = db.ref.account?.req || [];
    const odb = this.reqlist || [];

    this.cardlist = this.el.querySelector('.card-list');

    const rdb = ndb.filter(ch => !odb.map(och => och.id).includes(ch.id));
    if(rdb.length > 0) {
      let ereq = document.querySelector('.freq');
      if(!ereq) {
        ereq = document.createElement('div');
        ereq.classList.add('freq');
        ereq.innerHTML = `<div class="note"><p>Friend Requests</p></div>`;
        this.cardlist.prepend(ereq);
      }
      rdb.forEach(ch => {
        this.reqlist.push(ch);
        const card = elgen.friendCard(ch);
        ereq.prepend(card);
        card.onclick = async() => {
          if(userState.locked.bottom) return;
          userState.locked.bottom = true;
          await userState.pmbottom?.destroy?.();
          new Profile({user:ch}).run();
          userState.locked.bottom = false;
        }
      });
      ereq.prepend(ereq.querySelector('.note'));
    }
  }
  fupdate() {
    this.getFriendlist();
    this.getReqList();
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
    userState.pmmid = this;
    lang = userState.langs[userState.lang];
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    sceneIn(this.el);
    this.getFriendlist();
    this.getReqList();
  }
}