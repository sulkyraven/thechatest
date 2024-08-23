import modal from "../helper/modal.js";
import userState from "../manager/userState.js";
import _navlist from "./_navlist.js";

export default class {
  constructor() {
    this.isLocked = false;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('nav');
  }
  getNav() {
    _navlist.forEach(btn => {
      const elnav = document.createElement('div');
      elnav.classList.add('btn');
      if(btn.id === 'chats') elnav.classList.add('selected');
      elnav.innerHTML = btn.text;
      this.el.append(elnav);
      elnav.onclick = () => btn.run();
    });
  }
  destroy() {
    return new Promise(async resolve => {
      this.el.classList.add('out');
      await modal.waittime();
      this.el.remove();
      this.isLocked = false;
      userState.pmtop = null;
      resolve();
    });
  }
  run() {
    userState.pmtop = this;
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    this.getNav();
  }
}