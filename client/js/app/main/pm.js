import Nav from "/js/app/pmt/Nav.js";
import AppName from "/js/app/pmt/AppName.js";
import Chats from "/js/app/pmm/Chats.js";
import Empty from "/js/app/pmb/Empty.js";
import Account from "/js/app/pmb/Account.js";

export default class {
  constructor() {}
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('fuwi', 'pm');
  }
  renderSects() {
    new Nav().run();
    new AppName().run();
    new Chats().run();
    this.isfirst ? new Account().run() : new Empty().run();
  }
  run(isfirst = false) {
    this.isfirst = isfirst;
    this.createElement();
    document.querySelector('.app').append(this.el);
    this.renderSects();
  }
}