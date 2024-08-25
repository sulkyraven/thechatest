import modal from "../helper/modal.js";
import xhr from "../helper/xhr.js";
import db from "../manager/db.js";
import userState from "../manager/userState.js";
let lang = {};

export default class {
  constructor() {
    this.id = 'account';
    this.isLocked = false;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('acc');
    this.el.innerHTML = `
    <div class="top">
      <div class="btn"><i class="fa-solid fa-arrow-left"></i></div>
      <div class="sect-title">Settings</div>
    </div>
    <div class="wall">
      <div class="chp userphoto">
        <div class="outer-img">
          <img src="${db.ref.account.img || '/assets/user.jpg'}" alt="${db.ref.account.username}" width="150" />
          <div class="btn btn-img"><i class="fa-solid fa-pen-to-square"></i></div>
        </div>
      </div>
      <div class="chp userid">
        <div class="outer">
          <div class="chp-t">ID</div>
          <div class="chp-f"><p>${db.ref.account.id}</p></div>
        </div>
      </div>
      <div class="chp username">
        <div class="outer">
          <div class="chp-t">Username</div>
          <div class="chp-f"><p>@${db.ref.account.username}</p></div>
          <div class="chp-e btn-username"><i class="fa-solid fa-pen-to-square"></i> Edit</div>
        </div>
      </div>
      <div class="chp userdisplayname">
        <div class="outer">
          <div class="chp-t">Display Name</div>
          <div class="chp-f"><p>/p></div>
          <div class="chp-e btn-displayname"><i class="fa-solid fa-pen-to-square"></i> Edit</div>
        </div>
      </div>
      <div class="chp userbio">
        <div class="outer">
          <div class="chp-t">About</div>
          <div class="chp-f"><p></p></div>
          <div class="chp-e btn-bio"><i class="fa-solid fa-pen-to-square"></i> Edit</div>
        </div>
      </div>
      <div class="chp useremail">
        <div class="outer">
          <div class="chp-t">Email</div>
          <div class="chp-f"><p>${db.ref.account.email}</p></div>
          <div class="chp-n"><p>*other user cannot see this information</p></div>
        </div>
      </div>
      <div class="chp userlang">
        <div class="outer">
          <div class="chp-t">Language</div>
          <div class="chp-f"><p>Bahasa Indonesia</p></div>
          <div class="chp-l">
            <select name="sel-lang" id="sel-lang">
              <option value="null">Change Language</option>
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
      <div class="chp usersign">
        <p><a href="/auth/logout"><i class="fa-light fa-triangle-exclamation"></i> LOG OUT</a></p>
      </div>
    </div>`;
    this.ephoto = this.el.querySelector('.userphoto .outer-img');
    this.euname = this.el.querySelector('.username .outer .chp-f p');
    this.edname = this.el.querySelector('.userdisplayname .outer .chp-f p');
    this.ebio = this.el.querySelector('.userbio .outer .chp-f p');

    this.edname.innerText = db.ref.account.displayName;
    this.ebio.innerText = db.ref.account.bio;
  }
  btnListener() {
    const btnUname = this.el.querySelector('.btn-username');
    btnUname.onclick = async() => {
      if(this.isLocked === true) return;
      this.isLocked = true
      const getUname = await modal.prompt({
        msg: lang.ACC_USERNAME,
        ic: 'pencil',
        val: db.ref.account.username,
        nows: true,
        max: 20
      });
      if(!getUname) {
        this.isLocked = false;
        return;
      }
      const setUname = await modal.loading(xhr.post('/uwu/set-username', {uname:getUname}));
      if(setUname?.code === 402) {
        await modal.alert(`${lang.ACC_FAIL_UNAME_COOLDOWN}<br/><b>${new Date(setUname.msg).toLocaleString()}</b>`);
        this.isLocked = false;
        return;
      }
      if(setUname?.code !== 200) {
        await modal.alert(lang[setUname.msg] || lang.ERROR);
        this.isLocked = false;
        return;
      }
      db.ref.account.username = setUname.data.text;
      this.euname.innerText = '@'+setUname.data.text;
      this.isLocked = false;
    }
    const btnDname = this.el.querySelector('.btn-displayname');
    btnDname.onclick = async() => {
      if(this.isLocked === true) return;
      this.isLocked = true
      const getDname = await modal.prompt({
        ic: 'marker',
        msg: lang.ACC_DISPLAYNAME,
        val: db.ref.account.displayName,
      });
      if(!getDname) {
        this.isLocked = false;
        return;
      }
      const setDname = await modal.loading(xhr.post('/uwu/set-displayname', {dname:getDname}));
      if(!setDname || setDname.code !== 200) {
        await modal.alert(setDname.msg || lang.ERROR);
        this.isLocked = false;
        return;
      }
      this.edname.innerText = setDname.data.text;
      this.isLocked = false;
    }

    const btnBio = this.el.querySelector('.btn-bio');
    btnBio.onclick = async() => {
      if(this.isLocked === true) return;
      this.isLocked = true
      const getBio = await modal.prompt({
        msg: lang.ACC_BIO, tarea: true, val: db.ref.account.bio, ic:'book-open-cover'
      });
      if(!getBio) {
        this.isLocked = false;
        return;
      }
      const setBio = await modal.loading(xhr.post('/uwu/set-bio', {bio:getBio}));
      if(!setBio || setBio.code !== 200) {
        await modal.alert(setBio.msg || lang.ERROR);
        this.isLocked = false;
        return;
      }
      this.ebio.innerText = setBio.data.text;
      this.isLocked = false;
    }
    const btnImg = this.el.querySelector('.btn-img');
    btnImg.onclick = () => {
      const inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'image/*';
      inp.onchange = async() => {
        if(this.isLocked === true) return;
        this.isLocked = true
        const file = inp.files[0];
        let tempsrc = URL.createObjectURL(file);
        const getImg = await modal.confirm({
          ic: 'circle-question',
          msg: lang.ACC_IMG,
          img: tempsrc
        });
        this.isLocked = false;
        return;
      }
      inp.click();
    }
  }
  destroy() {
    this.el.remove();
    userState.pmbottom = null;
  }
  async run() {
    await userState.pmbottom?.destroy?.();
    userState.pmbottom = this;
    lang = userState.langs[userState.lang];
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    this.btnListener();
  }
}