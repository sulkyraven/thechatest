import modal from "../helper/modal.js";
import xhr from "../helper/xhr.js";
import db from "../manager/db.js";
import elgen from "../manager/elgen.js";
import userState from "../manager/userState.js";
let lang = {};

export default class {
  constructor({group}) {
    this.group = group;
    this.isLocked = false;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('acc');
    this.el.innerHTML = `
    <div class="top flex">
      <div class="left">
        <div class="btn"><i class="fa-solid fa-arrow-left"></i></div>
        <div class="sect-title">Groups</div>
      </div>
      <div class="right">
        <div class="btn"><i class="fa-solid fa-ellipsis-vertical"></i></div>
      </div>
    </div>
    <div class="wall">
      <div class="chp userphoto">
        <div class="outer-img">
          <img src="${this.group.i ? `/img/group/${this.group.id}` : '/assets/group.jpg'}" alt="${this.group.id}"/>
          <div class="btn btn-img"><i class="fa-solid fa-pen-to-square"></i></div>
        </div>
      </div>
      <div class="chp groupname">
        <div class="outer">
          <div class="chp-t">Group Name</div>
          <div class="chp-f"><p></p></div>
          <div class="chp-e btn-groupname"><i class="fa-solid fa-pen-to-square"></i> Edit</div>
        </div>
      </div>
      <div class="chp groupid">
        <div class="outer">
          <div class="chp-t">Group ID</div>
          <div class="chp-f"><p></p></div>
        </div>
      </div>
      <div class="chp grouptype">
        <div class="outer">
          <div class="chp-t">Visibility</div>
          <div class="chp-f"><p>Private</p></div>
          <div class="chp-l">
            <select name="sel-lang" id="sel-lang">
              <option value="null">Change Visibility</option>
              <option value="id">Private</option>
              <option value="en">Public</option>
            </select>
          </div>
        </div>
      </div>
      <div class="chp groupmember">
        <div class="outer">
          <div class="chp-t">Members</div>
          <div class="chp-u"><ul></ul></div>
        </div>
      </div>
    </div>`;
    this.gimg = this.el.querySelector('.userphoto .outer-img');
    this.gname = this.el.querySelector('.groupname .chp-f p');
    this.gid = this.el.querySelector('.groupid .chp-f p');
    this.gtype = this.el.querySelector('.grouptype .chp-f p');
    this.gmember = this.el.querySelector('.groupmember .chp-u ul');

  }
  renderDetail() {
    this.gname.innerText = this.group.n;
    this.gid.innerHTML = this.group.id.toUpperCase();
    this.gtype.innerHTML = this.group.t === '1' ? 'Private' : 'Public';
    this.group.users.forEach(usr => {
      const card = elgen.groupMemberCard(usr, this.group.o);
      this.gmember.append(card);
    });
    const scard = elgen.groupMemberCard(db.ref.account, this.group.o);
    this.gmember.prepend(scard);
  }
  btnListener() {
    const btnGname = this.el.querySelector('.btn-groupname');
    btnGname.onclick = async() => {
      if(this.isLocked === true) return;
      this.isLocked = true;
      const getGname = await modal.prompt({
        ic: 'marker', max: 45,
        msg: lang.GRPS_DNAME,
        val: this.group.n,
        iregex: /(\s)(?=\s)/g
      });
      if(!getGname) {
        this.isLocked = false;
        return;
      }
      if(getGname === this.group.n) {
        this.isLocked = false;
        return;
      }
      const setGname = await modal.loading(xhr.post('/group/uwu/set-groupname', {gname:getGname}));
      if(setGname?.code === 402) {
        await modal.alert(`${lang.GRPS_DNAME_COOLDOWN}<br/><b>${new Date(setGname.msg).toLocaleString()}</b>`);
        this.isLocked = false;
        return;
      }
      if(!setGname || setGname.code !== 200) {
        await modal.alert(lang[setGname.msg] || lang.ERROR);
        this.isLocked = false;
        return;
      }
      const gIndex = db.ref.groups?.findIndex(k => k.id === this.group.id);

      if(gIndex >= 0) {
        db.ref.groups[gIndex].n = setGname.data.text;
      }
      this.gname.innerText = setGname.data.text;
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
          msg: lang.GRPS_IMG,
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

        const setImg = await modal.loading(xhr.post('/group/uwu/set-img', {img:imgsrc,name:file.name}, '.loading .box p'), 'UPLOADING');
        if(setImg?.code !== 200) {
          await modal.alert(lang[setImg.msg] || lang.ERROR);
          this.isLocked = false;
          return;
        }
        this.gimg.querySelector('img').remove();
        const img = new Image();
        img.src = tempsrc;
        this.gimg.prepend(img);

        this.isLocked = false;
        return;
      }
      inp.click();
    }

  }
  async run() {
    await userState.pmbottom?.destroy?.();
    userState.pmbottom = this;
    lang = userState.langs[userState.lang];
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    this.renderDetail();
    this.btnListener();
  }
}