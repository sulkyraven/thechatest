import modal from "../helper/modal.js";
import xhr from "../helper/xhr.js";
import userState from "../manager/userState.js";
let lang = {};

export default class Sign {
  constructor() {
    this.islocked = false;
    this.path = '/login';
  }
  async getLang() {
    lang = userState.langs[userState.lang];
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('sign');
    this.el.innerHTML = `
    <div class="fuwi sign">
      <div class="card">
        <div class="title">
          <h1><img src="./assets/kirimin_icon.png" alt="Kirimin" width="50"> ${lang.SIGN_01A}</h1>
        </div>
        <div class="language">
          <select name="sel-lang" id="sel-lang" class="sel-lang">
            <option value="null">Language</option>
            <option value="id">Bahasa Indonesia</option>
            <option value="en">English</option>
          </select>
        </div>
        <form class="form" action="/login" method="post" id="login-form">
          <div class="field" data-input="signin">
            <div class="input">
              <div class="text">
                <p><label for="email">Email:</label></p>
              </div>
              <input type="email" name="email" id="email" autocomplete="email" placeholder="example@example.com" required/>
            </div>
          </div>
          <div class="field">
            <button type="submit">${lang.SIGN_01B}</button>
          </div>
          <div class="field">
            <div class="oldschool">
              <p class="center"><a href="#old-provider">${lang.SIGN_03}</a></p>
            </div>
          </div>
        </form>
      </div>
    </div>`;
  }
  langListener() {
    this.changelang = this.el.querySelector('#sel-lang');
    this.changelang.onchange = async() => {
      if(this.islocked === true) return;
      this.islocked = true;
      if(this.changelang.value === userState.lang) {
        this.islocked = false;
        return;
      }
      userState.lang = this.changelang.value;
      userState.save();
      await this.destroy();
      this.run();
    }
  }
  formListener() {
    document.querySelector('.oldschool').onclick = async(e) => {
      e.preventDefault();
      if(this.islocked === true) return;
      this.islocked = true;
      await modal.alert({msg:lang.SIGN_HELP_01,ic:'circle-info'});
      this.islocked = false;
    }
    this.form = this.el.querySelector('#login-form');
    this.form.onsubmit = async(e) => {
      e.preventDefault();
      if(this.islocked === true) return;
      this.islocked = true;

      let data = {};
      const formData = new FormData(this.form);
      for(const [key,val] of formData) { data[key] = val }
      const loginreq = await modal.loading(xhr.post(`/auth${this.path}`, data));
      if(!loginreq || loginreq.code !== 200) {
        await modal.alert(lang[loginreq.msg] || 'Something went wrong');
        this.islocked = false;
        if(loginreq.code === 402) {
          await this.destroy();
          return this.run();
        }
        return;
      }
      if(loginreq.data.step === 1) {
        this.changelang.parentElement.remove();
        document.querySelector('.oldschool').parentElement.remove();
        this.path = '/verify';
        this.renderCode();
        await modal.alert(lang.AUTH_SUCCESS_01);
        this.islocked = false;
      } else if(loginreq.data.step === 2) {
        this.path = '/login';
        this.islocked = false;
        this.destroy();
      }
    }
  }
  renderCode() {
    const field = document.querySelector('[data-input]');
    const inpt = document.createElement('div');
    inpt.classList.add('input');
    inpt.innerHTML = `
    <div class="text">
      <p><label for="code">6 Digits Code</label></p>
      <div class="btn" data-help="signin"><i class="fa-duotone fa-circle-question"></i></div>
    </div>
    <input type="number" class="code" name="code" id="code" min="0" max="999999" placeholder="------" required />`;
    field.append(inpt);
    inpt.querySelector('[data-help]').onclick = async() => {
      if(this.islocked === true) return;
      this.islocked = true;
      await modal.alert(lang.AUTH_SUCCESS_01);
      this.islocked = false;
    }
  }
  destroy() {
    return new Promise(async resolve => {
      this.el.classList.add('out');
      await modal.waittime();
      this.el.remove();
      this.islocked = false;
      this.path = '/login';
      resolve();
    });
  }
  async run() {
    await this.getLang();
    this.createElement();
    document.querySelector('.app').append(this.el);
    this.formListener();
    this.langListener();
  }
}