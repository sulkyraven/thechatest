import modal from "../helper/modal.js";
import sceneIn from "../helper/sceneIn.js";
import xhr from "../helper/xhr.js";
import db from "../manager/db.js";
import elgen from "../manager/elgen.js";
import userState from "../manager/userState.js";
import Content from "./Content.js";
import GroupSetting from "./GroupSetting.js";
let lang = {};

export default class {
  constructor() {
    this.id = 'groups';
    this.isLocked = false;
    this.list = [];
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('chts', 'pmm');
    this.el.innerHTML = `
    <div class="search flex">
      <div class="btn btn-join"><i class="fa-solid fa-right-to-bracket"></i> Join</div>
      <div class="btn btn-create"><i class="fa-solid fa-plus"></i> Create</div>
    </div>
    <div class="card-list"></div>`;
  }
  btnListener() {
    const btnCreate = this.el.querySelector('.btn-create');
    btnCreate.onclick = async() => {
      if(this.isLocked) return;
      this.isLocked = true;
      const gname = await modal.prompt({
        msg: lang.GRPS_ALR_NAME,
        ic: 'pencil'
      });
      if(!gname) {
        this.isLocked = false;
        return;
      }
      const cgroup = await modal.loading(xhr.post('/group/uwu/create', {name:gname}));
      if(!cgroup || cgroup.code !== 200) {
        await modal.alert(lang[cgroup.msg] || lang.ERROR);
        this.isLocked = false;
        return;
      }
      db.ref.groups.push(cgroup.data);
      this.isLocked = false;
      if(userState.locked.bottom) return;
      userState.locked.bottom = true;
      await userState.pmbottom?.destroy?.();
      new GroupSetting({group:cgroup.data}).run();
      userState.locked.bottom = false;
      this.forceUpdate();
    }
    const btnJoin = this.el.querySelector('.btn-join');
    btnJoin.onclick = async() => {
      if(this.isLocked) return;
      this.isLocked = true;
      const groupid = await modal.prompt(lang.GRPS_ALR_ID);
      if(!groupid) {
        this.isLocked = false;
        return;
      }
      const setjoin = await modal.loading(xhr.post('/group/uwu/join-group', {id:groupid}));
      if(setjoin?.code !== 200) {
        await modal.alert(lang[setjoin.msg] || lang.ERROR);
        this.isLocked = false;
        return;
      }
      db.ref.groups.push(setjoin.data);
      this.isLocked = false;
      if(userState.locked.bottom) return;
      userState.locked.bottom = true;
      await userState.pmbottom?.destroy?.();
      new Content({user:setjoin.data, conty:2}).run();
      userState.locked.bottom = false;
      this.forceUpdate();
    }
  }
  getGroupList() {
    const cdb = (db.ref.groups || []).sort((a, b) => {
      if(a.chats[a.chats.length - 1].ts < b.chats[b.chats.length - 1].ts) return 1;
      if(a.chats[a.chats.length - 1].ts > b.chats[b.chats.length - 1].ts) return -1;
      return 0;
    });

    this.cardlist = this.el.querySelector('.card-list');
    if(cdb.length < 1) this.cardlist.innerHTML = `<p class="center nomore"><i>${lang.CHTS_NOCHAT}</i></p>`;
    if(cdb.length > 0) this.cardlist.querySelector('.nomore')?.remove();
    cdb.forEach(ch => {
      const {card, uc} = elgen.groupCard(ch);
      if(!uc) {
        this.cardlist.append(card);
        card.onclick = async() => {
          if(userState.locked.bottom) return;
          userState.locked.bottom = true;
          await userState.pmbottom?.destroy?.();
          new Content({user:ch, conty:2}).run();
          userState.locked.bottom = false;
        }
      }
    });

    /*
    this.cardlist = this.el.querySelector('.card-list');

    const ndb = db.ref?.groups || [];
    const odb = this.list || [];
    const fdb = ndb.filter(ch => !odb.map(och => och.id).includes(ch.id));
    fdb.forEach(ch => {
      this.list.push(ch);
      const card = elgen.groupCard(ch);
      this.cardlist.append(card);
      card.onclick = async() => {
        if(userState.locked.bottom) return;
        userState.locked.bottom = true;
        await userState.pmbottom?.destroy?.();
        new Content({user:ch, conty:2}).run();
        userState.locked.bottom = false;
      }
    });
    if(this.list.length < 1) {
      this.cardlist.innerHTML = `<p class="center"><i>${lang.CHTS_NOCHAT}</i></p>`;
    }
    */
  }
  forceUpdate() {
    this.getGroupList();
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
    });
  }
  async run() {
    userState.pmmid = this;
    lang = userState.langs[userState.lang];
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    sceneIn(this.el);
    this.btnListener();
    this.getGroupList();
  }
}