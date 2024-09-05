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
      card.onclick = () => new Profile({user:ch}).run();
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
      userState.pmmid = null;
      resolve();
    })
  }
  async run() {
    await userState.pmmid?.destroy?.();
    lang = userState.langs[userState.lang];
    userState.pmmid = this;
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    sceneIn(this.el);
    this.getFriendlist();
  }
}