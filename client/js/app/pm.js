import Nav from "./Nav.js";
import AppName from "./AppName.js";
import Chts from "./Chts.js";
import Empty from "./Empty.js";
import Account from "./Account.js";

export default class {
  constructor() {}
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('fuwi', 'pm');
  }
  renderSects() {
    new Nav().run();
    new AppName().run();
    new Chts().run();
    this.isfirst ? new Account().run() : new Empty().run();
  }
  run(isfirst = false) {
    this.isfirst = isfirst;
    this.createElement();
    document.querySelector('.app').append(this.el);
    this.renderSects();
  }
}