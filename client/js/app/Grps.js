import modal from "../helper/modal.js";
import userState from "../manager/userState.js";
let lang = {};

export default class {
  constructor() {
    this.isLocked = false;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('chts');
    this.el.innerHTML = `
    <div class="search flex">
      <div class="btn-join"><i class="fa-solid fa-right-to-bracket"></i> Join</div>
      <div class="btn-create"><i class="fa-solid fa-plus"></i> Create</div>
    </div>
    <div class="card-list">
      <div class="card">
        <div class="left">
          <div class="img">
            <img src="./assets/group.jpg" alt="user" width="50"/>
          </div>
          <div class="detail">
            <div class="name"><p>Ini group</p></div>
            <div class="last">Deva: Aowkwkk</div>
          </div>
        </div>
        <div class="right">
          <div class="last">11/12/24</div>
          <div class="unread">7</div>
        </div>
      </div>
    </div>`;
  }
  btnListener() {
    const btnCreate = this.el.querySelector('.btn-create');
    btnCreate.onclick = async() => {
      if(this.isLocked) return;
      this.isLocked = true;
      const gname = await modal.prompt({
        msg: lang.GROUP_ALR_NAME,
        ic: 'pencil'
      });
      if(!gname) {
        this.isLocked = false;
        return;
      }
      console.log(gname);
      // INI REQUEST KE SERVER BUAT BIKIN GRUP BARU
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
    });
  }
  async run() {
    await userState.pmmid?.destroy?.();
    userState.pmmid = this;
    lang = userState.langs[userState.lang];
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    this.btnListener();
  }
}