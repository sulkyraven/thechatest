import modal from "/js/helper/modal.js";
import sceneIn from "/js/helper/sceneIn.js";
import userState from "/js/manager/userState.js";
let lang = {};

export default class {
  constructor() {
    this.id = 'empty';
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('empty', 'pmb');
    this.el.innerHTML = `
    <div class="title">
      <div class="img">
        <img src="/assets/kirimin_icon.png" alt="Kirimin" width="75" />
      </div>
      <h1>KIRIMIN</h1>
    </div>
    <div class="desc">
      <p>${lang.LANDING}</p>
    </div>`;
  }
  destroy() {
    return new Promise(async resolve => {
      this.el.classList.add('out');
      await modal.waittime();
      this.el.remove();
      this.isLocked = false;
      userState.pmbottom = null;
      resolve();
    });
  }
  async run() {
    userState.pmbottom = this;
    lang = userState.langs[userState.lang];
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    sceneIn(this.el);
  }
}