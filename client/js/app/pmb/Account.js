import modal from "/js/helper/modal.js";
import sceneIn from "/js/helper/sceneIn.js";
import xhr from "/js/helper/xhr.js";
import { setbadge } from "/js/manager/badge.js";
import db from "/js/manager/db.js";
import userState from "/js/manager/userState.js";
import * as nrw from "/js/manager/nrw.js";
import cloud from "/js/manager/cloud.js";
const langlist = [
  {id: 'lang-id', val: 'id', label: 'Bahasa Indonesia'},
  {id: 'lang-en', val: 'en', label: 'English'},
]
let lang = {};

export default class {
  constructor() {
    this.id = 'account';
    this.isLocked = false;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('acc', 'pmb');
    this.el.innerHTML = `
    <div class="top">
      <div class="btn btn-back"><i class="fa-solid fa-arrow-left"></i></div>
      <div class="sect-title">Settings</div>
    </div>
    <div class="wall">
      <div class="chp userphoto">
        <div class="outer-img">
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
          <div class="chp-f"><p></p></div>
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
          <div class="chp-n"><p>${lang.ACC_ONLY_YOU}</p></div>
        </div>
      </div>
      <div class="chp userlang">
        <div class="outer">
          <div class="chp-t">Language</div>
          <div class="chp-f"><p>${langlist.find(k => k.val === userState.lang).label}</p></div>
          <div class="chp-e btn-lang">Change Language <i class="fa-solid fa-chevron-down"></i></div>
        </div>
      </div>
      <div class="chp usersign">
        <p><a class="logout" href="/auth/logout"><i class="fa-light fa-triangle-exclamation"></i> LOG OUT</a></p>
      </div>
    </div>`;
    this.ephoto = this.el.querySelector('.userphoto .outer-img');
    this.euname = this.el.querySelector('.username .outer .chp-f p');
    this.euname.append(db.ref.account.username);
    if(db.ref.account.b) {
      for(const badge of db.ref.account.b.sort((a, b) => b - a)) {
        this.euname.append(setbadge(badge));
      }
    }

    this.edname = this.el.querySelector('.userdisplayname .outer .chp-f p');
    this.ebio = this.el.querySelector('.userbio .outer .chp-f p');
    this.elogout = this.el.querySelector('.usersign a.logout');

    const img = new Image();
    img.onerror = () => img.src = '/assets/user.jpg';
    img.src = db.ref.account.img ? `/file/user/${db.ref.account.img}` : '/assets/user.jpg';
    img.alt = db.ref.account.username;
    this.ephoto.prepend(img);

    this.edname.innerText = db.ref.account.displayName;
    this.ebio.innerText = db.ref.account.bio || 'No bio yet.';
  }
  btnListener() {
    this.elogout.onclick = async(e) => {
      e.preventDefault();

      if(this.isLocked) return;
      this.isLocked = true;
      const getLogout = await modal.confirm(lang.ACC_LOGOUT);
      if(!getLogout) {
        this.isLocked = false;
        return;
      }
      window.location.href = this.elogout.getAttribute('href');
      this.isLocked = false;
    }

    const btnUname = this.el.querySelector('.btn-username');
    btnUname.onclick = async() => {
      if(this.isLocked === true) return;
      this.isLocked = true;
      const getUname = await modal.prompt({
        msg: lang.ACC_USERNAME,
        ic: 'pencil',
        val: db.ref.account.username,
        iregex: /\s/g,
        max: 20
      });
      if(!getUname) {
        this.isLocked = false;
        return;
      }
      if(getUname === db.ref.account.username) {
        this.isLocked = false;
        return;
      }
      const setUname = await modal.loading(xhr.post('/account/uwu/set-username', {uname:getUname}));
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
      this.euname.innerHTML = '';
      this.euname.append('@'+setUname.data.text);
      if(db.ref.account.b) {
        for(const badge of db.ref.account.b.sort((a, b) => b - a)) {
          this.euname.append(setbadge(badge));
        }
      }
      this.isLocked = false;
    }
    const btnDname = this.el.querySelector('.btn-displayname');
    btnDname.onclick = async() => {
      if(this.isLocked === true) return;
      this.isLocked = true;
      const getDname = await modal.prompt({
        ic: 'marker', max: 45,
        msg: lang.ACC_DISPLAYNAME,
        val: db.ref.account.displayName,
        iregex: /(\s)(?=\s)/g
      });
      if(!getDname) {
        this.isLocked = false;
        return;
      }
      if(getDname === db.ref.account.displayName) {
        this.isLocked = false;
        return;
      }
      const setDname = await modal.loading(xhr.post('/account/uwu/set-displayname', {dname:getDname}));
      if(setDname?.code === 402) {
        await modal.alert(`${lang.ACC_FAIL_DNAME_COOLDOWN}<br/><b>${new Date(setDname.msg).toLocaleString()}</b>`);
        this.isLocked = false;
        return;
      }
      if(!setDname || setDname.code !== 200) {
        await modal.alert(lang[setDname.msg] || lang.ERROR);
        this.isLocked = false;
        return;
      }
      db.ref.account.displayName = setDname.data.text;
      this.edname.innerText = setDname.data.text;
      this.isLocked = false;
    }

    const btnBio = this.el.querySelector('.btn-bio');
    btnBio.onclick = async() => {
      if(this.isLocked === true) return;
      this.isLocked = true;
      const getBio = await modal.prompt({
        msg: lang.ACC_BIO, tarea: true, val: db.ref.account.bio, ic:'book-open-cover', max: 220,
        iregex: /(\s)(?=\s)/g
      });
      if(!getBio) {
        this.isLocked = false;
        return;
      }
      if(getBio === db.ref.account.bio) {
        this.isLocked = false;
        return;
      }
      const setBio = await modal.loading(xhr.post('/account/uwu/set-bio', {bio:getBio}));
      if(setBio?.code === 402) {
        await modal.alert(`${lang.ACC_FAIL_BIO_COOLDOWN}<br/><b>${new Date(setBio.msg).toLocaleString()}</b>`);
        this.isLocked = false;
        return;
      }
      if(setBio?.code !== 200) {
        await modal.alert(lang[setBio.msg] || lang.ERROR);
        this.isLocked = false;
        return;
      }
      db.ref.account.bio = setBio.data.text;
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
        this.isLocked = true;
        const file = inp.files[0];
        let tempsrc = URL.createObjectURL(file);
        const getImg = await modal.confirm({
          ic: 'circle-question',
          msg: lang.ACC_IMG,
          img: tempsrc
        });
        if(!getImg) {
          this.isLocked = false;
          return;
        }
        const imgsrc = await new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = () => {
            return resolve(reader.result);
          }
          reader.readAsDataURL(file);
        });

        const setImg = await modal.loading(xhr.post('/account/uwu/set-img', {img:imgsrc,name:file.name}, '.loading .box p'), 'UPLOADING');
        if(setImg?.code !== 200) {
          await modal.alert(lang[setImg.msg] || lang.ERROR);
          this.isLocked = false;
          return;
        }
        this.ephoto.querySelector('img').remove();
        const img = new Image();
        img.src = tempsrc;
        this.ephoto.prepend(img);

        this.isLocked = false;
        return;
      }
      inp.click();
    }

    const btnLang = this.el.querySelector('.btn-lang');
    btnLang.onclick = async() => {
      if(this.isLocked) return;
      this.isLocked = true;
      const langIndex = langlist.findIndex(llang => llang.val === userState.lang);
      if(langIndex >= 0) langlist[langIndex].actived = true;
  
      const selLang = await modal.select({
        msg: lang.ACC_CHOOSE_LANG,
        ic: 'globe',
        opt: {
          name: 'language',
          items: langlist
        }
      });
      if(!selLang) {
        this.isLocked = false;
        return;
      }
      const { language } = selLang;
      if(language === userState.lang) {
        this.isLocked = false;
        return;
      }
      userState.lang = language;
      userState.save();

      userState.pmbottom?.el?.remove();
      userState.pmmid?.el?.remove();
      userState.pmtop?.el?.remove();
      document.querySelector('.appname')?.remove();
      await modal.alert(lang.ACC_CHOOSE_LANG_DONE);
      cloud.isStopped = 1;
      await modal.loading(new Promise(async resolve => {
          window.location.reload();
          self.location.reload();
          location.reload();
          await waittime(1000 * 60);
          resolve();
        }), 'RELOADING'
      )

      this.isLocked = false;
    }
    const btnBack = this.el.querySelector('.btn-back');
    if(btnBack) btnBack.onclick = async() => {
      if(nrw.isNarrow) {
        await this.destroy();
        nrw.runQueue();
        nrw.setEmpty();
      }
    }
  }
  fRemove() {
    this.isLocked = false;
    userState.pmbottom = null;
    userState.pmlast = null;
    this.el.remove();
  }
  destroy() {
    return new Promise(async resolve => {
      this.el.classList.add('out');
      await modal.waittime();
      this.el.remove();
      this.isLocked = false;
      userState.pmbottom = null;
      userState.pmlast = null;
      resolve();
    });
  }
  run() {
    userState.pmbottom = this;
    userState.pmlast = this.id;
    lang = userState.langs[userState.lang];
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    sceneIn(this.el);
    this.btnListener();
  }
}