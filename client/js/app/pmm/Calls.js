import modal from "/js/helper/modal.js";
import sceneIn from "/js/helper/sceneIn.js";
import userState from "/js/manager/userState.js";
let lang = {};

export default class {
  constructor() {
    this.id = 'calls';
    this.isLocked = false;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('chats', 'pmm');
    this.el.innerHTML = `<br/><br/><div class="center"><p>This -Calls- feature is currently under development</p></div>`;
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
  run() {
    userState.pmmid = this;
    lang = userState.langs[userState.lang];
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    sceneIn(this.el);
  }
}