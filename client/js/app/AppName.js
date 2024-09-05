import userState from "../manager/userState.js";
import Account from "./Account.js";

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
      <div class="btn"><i class="fa-solid fa-magnifying-glass"></i></div>
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
      new Account().run();
    }
  }
  run() {
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    this.btnListener();
  }
}