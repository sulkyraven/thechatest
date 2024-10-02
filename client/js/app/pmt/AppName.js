import userState from "/js/manager/userState.js";
import Account from "/js/app/pmb/Account.js";

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
  destroy() {
    this.isLocked = false;
    this.el.remove();
  }
  btnListener() {
    const btnSettings = this.el.querySelector('.btn-settings');
    btnSettings.onclick = async() => {
      if(userState.pmbottom?.id === 'account') return;
      if(userState.locked.bottom) return;
      userState.locked.bottom = true;
      await userState.pmbottom?.destroy?.();
      new Account().run();
      userState.locked.bottom = false;
    }
    const btnFind = this.el.querySelector('.btn-find');
    btnFind.onclick = async() => {
      const navFind = document.querySelector('.nav-find');
      if(navFind) navFind.click();
    }
  }
  run() {
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    this.btnListener();
  }
}