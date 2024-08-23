import Nav from "./Nav.js";
import Chts from "./Chts.js";
import Empty from "./Empty.js";
import Account from "./Account.js";

export default class {
  constructor() {}
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('fuwi', 'pm');
    this.el.innerHTML = `
    <div class="nav"></div>
    <div class="list"></div>
    <div class="content"></div>`;
  }
  renderSects() {
    new Nav().run();
    new Chts().run();
    console.log('isfirst', this.isfirst);
    this.isfirst ? new Account().run() : new Empty().run();
  }
  run(isfirst = false) {
    this.isfirst = isfirst;
    this.createElement();
    document.querySelector('.app').append(this.el);
    this.renderSects();
  }
}