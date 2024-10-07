import userState from "/js/manager/userState.js";
import Account from "/js/app/pmb/Account.js";
import modal from "/js/helper/modal.js";
import { destroyPM, fRemovePM, isNarrow, setQueue } from "/js/manager/nrw.js";

export default class {
  constructor() {
    this.id = 'appname';
    this.isLocked = false;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('appname');
    this.el.innerHTML = `
    <div class="title">KIRIMIN</div>
    <div class="actions">
      <div class="btn btn-find"><i class="fa-solid fa-magnifying-glass"></i></div>
      <div class="btn btn-settings"><i class="fa-solid fa-gear"></i></div>
    </div>`;
  }
  btnListener() {
    const btnSettings = this.el.querySelector('.btn-settings');
    btnSettings.onclick = async() => {
      if(userState.pmbottom?.id === 'account') return;
      if(userState.locked.bottom) return;
      userState.locked.bottom = true;
      await userState.pmbottom?.destroy?.();
      if(isNarrow) {
        setQueue();
        await destroyPM();
        fRemovePM();
      }
      new Account().run();
      userState.locked.bottom = false;
    }
    const btnFind = this.el.querySelector('.btn-find');
    btnFind.onclick = async() => {
      const navFind = document.querySelector('.nav-find');
      if(navFind) navFind.click();
    }
  }
  fRemove() {
    this.isLocked = false;
    userState.pmtitle = null;
    this.el.remove();
  }
  destroy() {
    return new Promise(async resolve => {
      this.el.classList.add('out');
      await modal.waittime();
      this.isLocked = false;
      userState.pmtitle = null;
      this.el.remove();
      resolve();
    })
  }
  run() {
    userState.pmtitle = this;
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    this.btnListener();
  }
}