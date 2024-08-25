import modal from "../helper/modal.js";
import elgen from "../manager/elgen.js";
import userState from "../manager/userState.js";
let lang = {};

export default class {
  constructor() {
    this.id = 'find';
    this.isLocked = false;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('chts');
    this.el.innerHTML = `
    <div class="top">
      <div class="title">KIRIMIN</div>
      <div class="actions">
        <div class="btn"><i class="fa-solid fa-gear"></i></div>
      </div>
    </div>
    <div class="bottom">
      <div class="search">
        <p>${lang.FIND_RANDOM}</p>
        <div class="btn"><i class="fa-solid fa-play"></i> ${lang.FIND_START}</div>
      </div>
      <div class="search">
        <form action="/uwu/search-user" class="form form-search-user">
          <p><label for="search_input">${lang.FIND_ID}</label></p>
          <input type="text" name="search_input" id="search_input" placeholder="${lang.TYPE_HERE}" maxLength="30"/>
          <button class="btn"><i class="fa-solid fa-magnifying-glass"></i> ${lang.FIND_SEARCH}</button>
        </form>
      </div>
      <div class="card-list">
        <div class="card">
          <div class="left">
            <div class="img">
              <img src="./assets/user.jpg" alt="user" width="50"/>
            </div>
            <div class="detail">
              <div class="name"><p>Devanka</p></div>
              <div class="last">Aowkwk</div>
            </div>
          </div>
          <div class="right">
            <div class="last">11/12/24</div>
            <div class="unread">7</div>
          </div>
        </div>
      </div>
    </div>`;
  }
  btnListener() {
    const form = this.el.querySelector('.form-search-user');
    const inp = this.el.querySelector('#search_input');
    inp.oninput = () => inp.value = inp.value.replace(/\s/g, '');
    form.onsubmit = async e => {
      e.preventDefault();
      if(this.isLocked === true) return;
      this.isLocked = true;
      const getSearch = await modal.loading('/uwu/search-user', {id:inp.value});
      if(!getSearch || getSearch.code !== 200) {
        await modal.alert(lang.ERROR);
        this.isLocked = false;
        return;
      }
      if(getSearch.data.users.length < 1) {
        await modal.alert(lang.FIND_NOTFOUND);
        this.isLocked = false;
        return;
      }

      getSearch.data.users.forEach(usr => {
        const card = elgen.contentCard(usr);
        this.el.querySelector('.card-list').append(card);
        this.isLocked = false;
      });

    }
  }
  destroy() {
    return new Promise(resolve => {
      this.el.remove();
      this.isLocked = false;
      userState.pmmid = null;
      resolve();
    });
  }
  async run() {
    await userState.pmmid?.destroy?.();
    lang = userState.langs[userState.lang];
    userState.pmmid = this;
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
  }
}