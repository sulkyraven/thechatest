import userState from "../manager/userState.js";

export default class {
  constructor() {
    this.id = 'empty';
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('empty');
    this.el.innerHTML = `
    <div class="title">
      <div class="img">
        <img src="./assets/kirimin_icon.png" alt="Kirimin" width="75" />
      </div>
      <h1>KIRIMIN</h1>
    </div>
    <div class="desc">
      <p>Select a chat to start messaging</p>
    </div>`;
  }
  destroy() {
    this.el.remove();
    userState.pmbottom = null;
  }
  async run() {
    await userState.pmbottom?.destroy?.();
    userState.pmbottom = this;
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
  }
}