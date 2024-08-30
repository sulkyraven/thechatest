import modal from "../helper/modal.js";
import xhr from "../helper/xhr.js";
import db from "../manager/db.js";
import elgen from "../manager/elgen.js";
import userState from "../manager/userState.js";
import Content from "./Content.js";
import GroupSetting from "./GroupSetting.js";
let lang = {};

export default class {
  constructor() {
    this.isLocked = false;
    this.list = [];
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('chts');
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

      this.isLocked = false;
      new GroupSetting({group:cgroup.data.group}).run();
    }
  }
  getGroupList() {
    this.cardlist = this.el.querySelector('.card-list');

    const ndb = db.ref?.groups || [];
    const odb = this.list || [];

    const fdb = ndb.filter(ch => !odb.map(och => och.id).includes(ch.id));
    fdb.forEach(ch => {
      this.list.push(ch);
      const card = elgen.groupCard(ch);
      this.cardlist.append(card);
      card.onclick = () => new Content({user:ch, conty:2}).run();
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
    });
  }
  async run() {
    await userState.pmmid?.destroy?.();
    userState.pmmid = this;
    lang = userState.langs[userState.lang];
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    this.btnListener();
    this.getGroupList();
  }
}