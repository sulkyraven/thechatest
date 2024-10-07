import Nav from "/js/app/pmt/Nav.js";
import AppName from "/js/app/pmt/AppName.js";
import Chats from "/js/app/pmm/Chats.js";
import Empty from "/js/app/pmb/Empty.js";
import Account from "/js/app/pmb/Account.js";
import { windowresize, destroyPM, fRemovePM, isNarrow, setQueue, setEmpty } from "/js/manager/nrw.js";

export default class {
  constructor() {}
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('fuwi', 'pm');
  }
  async renderSects() {
    new Nav().run();
    new AppName().run();
    new Chats().run();
    if(this.isfirst) {
      if(isNarrow) {
        setQueue();
        await destroyPM();
        fRemovePM();
      }
      new Account().run();
    } else {
      if(isNarrow) {
        setEmpty();
      } else {
        new Empty().run();
      }
    }
  }
  run(isfirst = false) {
    this.isfirst = isfirst;
    this.createElement();
    document.querySelector('.app').append(this.el);
    windowresize();
    this.renderSects();
  }
}