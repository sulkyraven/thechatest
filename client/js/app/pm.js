import Nav from "./Nav.js";
import Chts from "./Chts.js";

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
    // nav - chts - content
    new Nav().run();
    new Chts().run();
  }
  run() {
    this.createElement();
    document.querySelector('.app').append(this.el);
    this.renderSects();
  }
}