import modal from "/js/helper/modal.js";
import userState from "/js/manager/userState.js";
import _navlist from "/js/app/pmt/_navlist.js";

export default class {
  constructor() {
    this.id = 'nav';
    this.isLocked = false;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('nav');
  }
  getNav() {
    _navlist.forEach(btn => {
      const elnav = document.createElement('div');
      elnav.classList.add('btn', `nav-${btn.id}`);
      // if(userState.pmmid?.id === btn.id) elnav.classList.add('selected');
      if(userState.pmmid?.id === btn.id) {
        elnav.classList.add('selected');
      } else if(!userState.pmmid?.id && btn.id === 'chats') {
        elnav.classList.add('selected');
      }
      elnav.innerHTML = btn.text;
      this.el.append(elnav);
      elnav.onclick = async() => {
        if(this.isLocked) return;
        this.isLocked = true;
        let midtop = [userState.pmmid?.id||'none',userState.pmbottom?.id||'none'];
        if(!midtop.includes(btn.id)) {
          if(!btn.noactive) {
            this.el.querySelectorAll('.selected').forEach(elod=>elod.classList.remove('selected'));
            elnav.classList.add('selected');
          }
          await btn.run();
          this.isLocked = false;
        }
        this.isLocked = false;
      }
    });
  }
  fRemove() {
    this.isLocked = false;
    userState.pmtop = null;
    this.el.remove();
  }
  destroy() {
    return new Promise(async resolve => {
      this.el.classList.add('out');
      await modal.waittime();
      this.isLocked = false;
      userState.pmtop = null;
      this.el.remove();
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