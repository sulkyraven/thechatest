import modal from "../helper/modal.js";
import sceneIn from "../helper/sceneIn.js";
import sdate from "../helper/sdate.js";
import xhr from "../helper/xhr.js";
import cloud from "../manager/cloud.js";
import db from "../manager/db.js";
import elgen from "../manager/elgen.js";
import userState from "../manager/userState.js";
import GroupSetting from "./GroupSetting.js";
import Profile from "./Profile.js";

export default class {
  constructor({ user, conty }) {
    this.conty = conty;
    this.user = user;
    this.id = 'content';
    this.isLocked = false;
    this.list = [];
    this.contents = {text:null,rep:null,file:{name:null,content:null}};
    this.planesend = false;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('content', 'pmb');
    this.el.innerHTML = `
    <div class="top">
      <div class="left">
        <div class="btn back"><i class="fa-solid fa-arrow-left"></i></div>
        <div class="user">
          <div class="img">
            <img src="${this.user.img}" alt="${this.user.username}" />
          </div>
          <div class="name"><p>${this.user.username}</p></div>
        </div>
      </div>
      <div class="right">
        <div class="btn">
          <i class="fa-solid fa-video"></i>
        </div>
        <div class="btn">
          <i class="fa-solid fa-phone"></i>
        </div>
        <div class="btn">
          <i class="fa-solid fa-ellipsis-vertical"></i>
        </div>
      </div>
    </div>
    <div class="mid">
      <div class="chats"></div>
    </div>
    <div class="bottom">
      <div class="field">
        <div class="input">
          <div class="emoji">
            <div class="btn btn-emoji">
              <i class="fa-solid fa-face-smile"></i>
            </div>
          </div>
          <div class="textbox">
            <textarea name="content-input" id="content-input" placeholder="Type Here"></textarea>
          </div>
          <div class="actions">
            <div class="btn btn-attach">
              <i class="fa-solid fa-paperclip"></i>
            </div>
            <div class="btn btn-image">
              <i class="fa-solid fa-camera-retro"></i>
            </div>
          </div>
        </div>
        <div class="voice">
          <div class="btn btn-voice">
            <i class="fa-solid fa-microphone"></i>
          </div>
        </div>
      </div>
    </div>`;
    this.chatlist = this.el.querySelector('.mid .chats');
    this.bottomclass = this.el.querySelector('.bottom');
    this.midclass = this.el.querySelector('.mid');
    this.topclass = this.el.querySelector('.top');
  }
  renderChats() {
    const csu = chatSelection(this.user, this.conty);
    this.user = {...this.user, ...csu};

    if(this.user?.db?.id) {
      cloud.peer.socket._socket.send(JSON.stringify({d761: {id:"readMsg", data:{id:this.user.db.id}}}));
    }

    const eluname = this.el.querySelector('.top .left .user .name');
    eluname.innerText = this.user.username;
    if(!this.user.db) return;
    const chts = this.user.db;

    if(!chts) return;
    const ndb = chts.chats || [];
    const odb = this.list;

    const fdb = ndb.filter(ch => !odb.map(och => och.id).includes(ch.id));
    fdb.forEach(ch => {
      this.list.push(ch);
      const card = elgen.contentCard(ch, chts, this.conty);
      this.chatlist.append(card);
      const chTxt = card.querySelector('.chp.text p');
      if(chTxt && chTxt.offsetWidth >= 470) card.classList.add('long');
    });
  }
  btnListener() {
    const eluser = document.querySelector('.top .left .user');
    eluser.onclick = async() => {
      if(userState.locked.bottom) return;
      userState.locked.bottom = true;
      await userState.pmbottom?.destroy?.();
      this.user.prof.run();
      userState.locked.bottom = false;
    }
  }
  formListener() {
    this.inpMsg = this.el.querySelector('#content-input');
    this.inpMsg.oninput = () => this.growInput();
    this.btnImg = this.el.querySelector('.btn-image');
    this.btnImg.onclick = () => this.findFile('image/*');
    this.btnFile = this.el.querySelector('.btn-attach');
    this.btnFile.onclick = () => this.findFile();
    this.btnSend = this.el.querySelector('.btn-voice');
    this.btnSend.onclick = async() => {
      if(this.planesend) return this.sendMessage();
      return this.sendVoice();
    }
  }
  growInput() {
    if(!this.planesend && (this.inpMsg.value.trim().length > 0 || this.contents.file?.content)) {
      this.planesend = true;
      this.btnSend.innerHTML = `<i class="fa-solid fa-chevron-right"></i>`;
    } else if(this.planesend && (this.inpMsg.value.trim().length < 1 && !this.contents.file.content)) {
      this.planesend = false;
      this.btnSend.innerHTML = `<i class="fa-solid fa-microphone"></i>`;
    }

    this.inpMsg.style.height = '24px';
    const inpMsgSHeight = this.inpMsg.scrollHeight > 80 ? 80 : this.inpMsg.scrollHeight;
    const inpDocumentSHeight = this.bottomclass.querySelector('.attach')?.offsetHeight || 0;
    const repSHeight = this.bottomclass.querySelector('.embed')?.offsetHeight || 0;
    const mediaHeights = inpDocumentSHeight + repSHeight;

    this.inpMsg.style.height = inpMsgSHeight + 'px';
    const forBottom = inpMsgSHeight < 30 ? (inpMsgSHeight + mediaHeights + 31) : (inpMsgSHeight + mediaHeights + (12 * 2));
    this.bottomclass.style.height = forBottom + 'px';
    this.midclass.style.height = `calc(100% - (60px + ${forBottom}px))`;
  }
  findFile(fileAccept = null) {
    const inp = document.createElement('input');
    inp.type = 'file';
    if(fileAccept) inp.accept = fileAccept;
    inp.onchange = async() => {
      const file = inp.files[0];

      const filesrc = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => {
          return resolve(reader.result);
        }
        reader.readAsDataURL(file);
      });
      this.contents.file.name = file.name;
      this.contents.file.content = filesrc;
      
      const attachbefore = this.bottomclass.querySelector('.attach');
      if(attachbefore) attachbefore.remove();

      this.attach = document.createElement('div');
      this.attach.classList.add('attach');
      this.attach.innerHTML = `<div class="media"></div><div class="close"><div class="btn"><i class="fa-duotone fa-circle-x"></i></div></div>`;

      const imgExt = /\.([a-zA-Z0-9]+)$/;
      const fileExt = file.name.match(imgExt)[1];

      if(['gif', 'jpg', 'jpeg', 'png', 'webp'].includes(fileExt.toLowerCase())) {
        this.showImage(this.attach, file);
      } else {
        this.showDocument(this.attach, file);
      }
      this.bottomclass.prepend(this.attach);
      const repembed = this.bottomclass.querySelector('.embed');
      if(repembed) this.bottomclass.prepend(repembed);
      this.growInput();
      const closeFile = this.attach.querySelector('.close');
      closeFile.onclick = () => this.closeAttach();
    }
    inp.click();
  }
  closeAttach() {
    this.contents.file.name = null;
    this.contents.file.content = null;
    this.attach?.remove();
    this.growInput();
  }
  showImage(eattach, file) {
    const tempsrc = URL.createObjectURL(file);
    eattach.querySelector('.media').innerHTML = `<div class="img"></div><div class="name"><p>fivem_wp.jpg</p></div>`;
    const eimg = eattach.querySelector('.media .img');
    const ename = eattach.querySelector('.media .name');
    ename.innerText = file.name;
    const img = new Image();
    img.src = tempsrc;
    eimg.append(img);
    img.onload = () => this.growInput();
    img.onerror = () => {
      img.remove();
      this.showDocument(eattach, file);
    }
  }
  showDocument(eattach, file) {
    eattach.querySelector('.media').innerHTML = `<div class="document"><p></p></div>`;
    eattach.querySelector('.media p').innerText = file.name;
  }
  async sendMessage() {
    const card = elgen.contentCard({
      id: "temp" + Date.now(),
      ts: Date.now(),
      txt: 'SENDING..',
      u: {id:db.ref.account.id},
      unread: true
    }, this.user.db, this.conty);
    card.querySelector('.chp.text p').innerHTML = '<i class="sending"></i>';
    card.querySelector('.chp.time p').innerHTML = sdate.time(Date.now()) + ' <i class="fa-regular fa-clock"></i>';
    card.querySelector('.chp.text p i').innerText = this.inpMsg.value.trim();
    this.chatlist.append(card);
    const chTxtTemp = card.querySelector('.chp.text p');
    if(chTxtTemp && chTxtTemp.offsetWidth >= 470) card.classList.add('long');

    this.contents.text = this.inpMsg.value.trim().length < 1 ? null : this.inpMsg.value.trim();

    const data = {conty:this.conty, id:this.user.id};
    if(this.contents.text) data.txt = this.contents.text;
    if(this.contents.file?.name && this.contents.file?.content) data.file = {...this.contents.file};
    if(this.contents.rep) data.rep = this.contents.rep;

    this.inpMsg.value = '';
    this.contents.file.name = null;
    this.contents.file.content = null;
    this.contents.rep = null;

    this.closeAttach();
    this.growInput();

    const sendMsg = await xhr.post('/chat/uwu/sendMessage', data);
    if(sendMsg?.code !== 200) {
      card.querySelector('.chp.text p').innerHTML = `<i class="failed">Gagal Mengirim Pesan<i>`;
      await modal.waittime(10000);
      card.remove();
      return;
    }
    cloud.send({id:'send-msg', to:this.conty === 1 ? this.user.id : this.user.users});
    card.remove();
    if(!this.user.db) {
      const newData =  {
        id: sendMsg.data.ckey,
        users: [{}],
        chats: []
      };
      Object.keys(this.user).forEach(k => {
        if(k === 'img' && !this.user.img.includes('/assets/')) {
          newData.users[0][k] = this.user[k];
        }
        if(['id', 'username', 'displayName', 'bio', 'peer', 'myreq', 'theirreq', 'isfriend'].includes(k)) {
          newData.users[0][k] = this.user[k];
        }
      });
      newData.chats.push(sendMsg.data);
      db.ref.chats.push(newData);
      this.renderChats();
      userState.pmmid?.forceUpdate?.();
      return;
    }
    // this.user.db.chats.push(sendMsg.data);
    const ckey = this.conty === 1 ? 'chats' : 'groups';
    db.ref[ckey]?.find(ck => ck.id === this.user.db.id)?.chats?.push(sendMsg.data);

    const sentcard = elgen.contentCard(sendMsg.data, this.user.db, this.conty);
    this.chatlist.appendChild(sentcard);
    const chTxt = sentcard.querySelector('.chp.text p');
    if(chTxt && chTxt.offsetWidth >= 470) sentcard.classList.add('long');
    userState.pmmid?.forceUpdate?.();
  }
  sendVoice() {
    alert('not yet available');
  }
  destroy() {
    return new Promise(async resolve => {
      this.list = [];
      this.contents = {text:null,rep:null,file:{name:null,content:null}};
      this.planesend = false;
      this.inpMsg.removeEventListener('input', this.growInput);
      this.el.classList.add('out');
      await modal.waittime();
      this.el.remove();
      this.isLocked = false;
      userState.pmbottom = null;
      resolve();
    });
  }
  async run() {
    userState.pmbottom = this;
    this.user = {...this.user, img: imageSelection(this.user, this.conty)}
    // this.user.img = imageSelection(this.user, this.conty);
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    sceneIn(this.el);
    this.btnListener();
    this.renderChats();
    this.formListener();
  }
}

function chatSelection(obj, conty) {
  if(conty === 1) return {
    id: obj.id,
    username: obj.username,
    db: db.ref.chats?.find(ch => ch.users.find(k => k.id === obj.id)),
    prof: new Profile({user:{...obj, img:obj.img.includes('/assets/')?null:obj.img}}),
  }
  if(conty === 2) return {
    id: obj.id,
    username: obj.n,
    db: db.ref.groups?.find(ch => ch.id === obj.id),
    prof: new GroupSetting({group:obj}),
  }
}
function imageSelection(obj, conty) {
  if(conty === 1) return obj.img ? `/file/user/${obj.id}` : '/assets/user.jpg';
  if(conty === 2) return obj.i ? `/file/group/${obj.id}` : '/assets/group.jpg';
}