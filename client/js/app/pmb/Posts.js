import modal from "/js/helper/modal.js";
import sceneIn from "/js/helper/sceneIn.js";
import userState from "/js/manager/userState.js";
import * as nrw from "/js/manager/nrw.js";
let lang = {};

export default class {
  constructor() {
    this.id = 'posts';
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('empty', 'pmb');
    this.el.innerHTML = `
    <div class="top">
      <div class="btn btn-back"><i class="fa-solid fa-arrow-left"></i></div>
      <div class="sect-title">POSTS</div>
    </div>
    <div class="title">
      <h1>Comeback Later</h1>
    </div>
    <div class="desc">
      <p>This -Posts- feature is currently under maintenance</p>
    </div`;
  }
  btnListener() {
    const btnBack = this.el.querySelector('.btn-back');
    if(btnBack) btnBack.onclick = async() => {
      if(nrw.isNarrow) {
        await this.destroy();
        nrw.runQueue();
        nrw.setEmpty();
      }
    }
  }
  fRemove() {
    this.isLocked = false;
    userState.pmbottom = null;
    userState.pmlast = null;
    this.el.remove();
  }
  destroy() {
    return new Promise(async resolve => {
      this.el.classList.add('out');
      await modal.waittime();
      this.el.remove();
      this.isLocked = false;
      userState.pmbottom = null;
      userState.pmlast = null;
      resolve();
    });
  }
  run() {
    userState.pmbottom = this;
    userState.pmlast = this.id;
    lang = userState.langs[userState.lang];
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    sceneIn(this.el);
    this.btnListener();
  }
}