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
    this.chatcount = 0;
    this.contents = {text:null,rep:null,file:{name:null,content:null}};
    this.planesend = false;
    this.downed = new Set();
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
  setReadChat() {
    const csu = chatSelection(this.user, this.conty);
    this.user = {...this.user, ...csu};

    const ckey = this.conty === 1 ? 'chats' : 'groups';
    const cdb = db.ref[ckey]?.find(ck => ck.id === this.user.db.id);

    if(this.user?.db?.id) {
      cloud.peer.socket._socket.send(JSON.stringify({d761: {id:"readMsg", data:{id:this.user.db.id}}}));
      let peers = cdb?.users.filter(usr => usr.peer)?.map(usr => usr.peer) || [];
      cloud.send({ "id": "read-msg", "to": peers })
    }
  }
  renderChats() {
    const ckey = this.conty === 1 ? 'chats' : 'groups';
    const cdb = db.ref[ckey]?.find(ck => ck.id === this.user.db.id);

    const eluname = this.el.querySelector('.top .left .user .name');
    eluname.innerText = this.user.username;

    const fdb = (cdb?.chats || []).sort((a, b) => {
      if(a.ts < b.ts) return -1;
      if(a.ts > b.ts) return 1;
      return 0;
    });

    fdb.forEach(ch => {
      const {card, uc} = elgen.contentCard(ch, cdb, this.conty);
      card.onclick = async e => {
        const elsender = card.querySelector('.sender');
        if(elsender?.contains(e.target) && ch.u.id !== db.ref.account.id) {
          if(userState.locked.bottom) return;
          userState.locked.bottom = true;
          await userState.pmbottom?.destroy?.();
          userState.locked.bottom = false;
          return new Profile({user:{...ch.u}}).run();
        }
        if(this.isLocked) return;
        this.isLocked = true;
        return this.chatOptions(card, ch);
      }
      if(!uc) {
        this.chatlist.appendChild(card);
      }
      const chTxt = card.querySelector('.chp.text p');
      if(chTxt && chTxt.offsetWidth >= 470) card.classList.add('long');
    });
    if(fdb.length > this.chatcount) this.setReadChat();
    this.chatcount = fdb.length;
  }
  chatOptions(oldcard, ch) {
    const oldchatpop = this.el.querySelector('.chatpop');
    if(oldchatpop) oldchatpop.remove();
    const chatpop = document.createElement('div');
    chatpop.classList.add('chatpop');
    chatpop.innerHTML = `
    <div class="box"><div class="chats"></div><div class="actions"></div></div>`;
    const card = oldcard.cloneNode(true);
    card.removeAttribute('id');
    chatpop.querySelector('.chats').append(card);

    const btnReply = document.createElement('div');
    btnReply.classList.add('btn', 'btn-reply');
    btnReply.innerHTML = `<i class="fa-solid fa-reply"></i> REPLY`;
    chatpop.querySelector('.actions').append(btnReply);
    btnReply.onclick = async() => {
      chatpop.classList.add('out');
      await modal.waittime();
      card.remove();
      chatpop.remove();
      this.isLocked = false;
      this.showReply(ch);
    }

    if(ch.u.id === db.ref.account.id) {
      const btnEdit = document.createElement('div');
      btnEdit.classList.add('btn', 'btn-edit');
      btnEdit.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> EDIT`;

      const btnDelete = document.createElement('div');
      btnDelete.classList.add('btn', 'btn-delete');
      btnDelete.innerHTML = `<i class="fa-solid fa-trash-can"></i> DELETE`;

      chatpop.querySelector('.actions').append(btnEdit, btnDelete);
    }

    const btnCancel = document.createElement('div');
    btnCancel.classList.add('btn', 'btn-cancel');
    btnCancel.innerHTML = `<i class="fa-solid fa-circle-x"></i> CANCEL`;
    chatpop.querySelector('.actions').append(btnCancel);
    btnCancel.onclick = async() => {
      chatpop.classList.add('out');
      await modal.waittime();
      card.remove();
      chatpop.remove();
      this.isLocked = false;
    }

    this.el.append(chatpop);
  }
  showReply(ch) {
    const oldreply = this.el.querySelector('.bottom .embed');
    if(oldreply) oldreply.remove();
    this.contents.rep = null;

    const card = document.createElement('div');
    card.classList.add('embed');
    card.innerHTML = `
    <div class="box">
      <div class="left">
        <p>${ch.u.id === db.ref.account.id ? db.ref.account.username : ch.u.username}</p>
        <p class="msg">Lorem ipsum dol ...</p>
      </div>
      <div class="right">
        <div class="btn btn-cancel-rep"><i class="fa-duotone fa-circle-x"></i></div>
      </div>
    </div>`;
    const chtxt = card.querySelector('.left .msg');
    chtxt.innerText = ch.txt.length > 50 ? ch.txt.substring(0,47).trim().replace(/\s/g, ' ') + ' ...' : ch.txt.trim().replace(/\s/g, ' ');

    const cancelReply = card.querySelector('.right .btn-cancel-rep');
    cancelReply.onclick = () => {
      this.contents.rep = null;
      card.remove();
      this.growInput();
    }
    this.contents.rep = ch.id;
    this.bottomclass.prepend(card);
    this.growInput();
    /*
    <div class="embed">
      <div class="box">
        <div class="left">
          <p>Devanka</p>
          <p>Lorem ipsum dol ...</p>
        </div>
        <div class="right">
          <div class="btn"><i class="fa-duotone fa-circle-x"></i></div>
        </div>
      </div>
    </div>
    */
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
  keyDown(e) {
    const key = e.key.toLowerCase();
    if(key === 'shift') this.downed.add(key);
    if(key === 'enter' && this.downed.has('shift')) {
      e.preventDefault();
      if(this.planesend) return this.sendMessage();
    }
  }
  keyUp(e) {
    const key = e.key.toLowerCase();
    if(key === 'shift') {
      if(this.downed.has(key)) this.downed.delete(key);
    }
  }
  formListener() {
    this.inpMsg = this.el.querySelector('#content-input');
    this.inpMsg.oninput = () => this.growInput();
    this.inpMsg.onkeydown = e => this.keyDown(e);
    this.inpMsg.onkeyup = e => this.keyUp(e);

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
    const {card} = elgen.contentCard({
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
    const ckey = this.conty === 1 ? 'chats' : 'groups';
    const cdb = db.ref[ckey]?.find(ck => ck.id === this.user.db.id);
    cloud.send({ "id": "send-msg", "to": sendMsg.peers, "data": { "text": sendMsg.data.txt } })

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
      this.setReadChat();
      this.renderChats();
      userState.pmbottom?.forceUpdate?.();
      userState.pmmid?.forceUpdate?.();
      return;
    }
    // this.user.db.chats.push(sendMsg.data);
    cdb?.chats?.push(sendMsg.data);

    const sentcard = elgen.contentCard(sendMsg.data, this.user.db, this.conty).card;
    this.chatlist.appendChild(sentcard);
    const chTxt = sentcard.querySelector('.chp.text p');
    if(chTxt && chTxt.offsetWidth >= 470) sentcard.classList.add('long');
    userState.pmbottom?.forceUpdate?.();
    userState.pmmid?.forceUpdate?.();
  }
  sendVoice() {
    alert('not yet available');
  }
  forceUpdate() {
    this.renderChats();
  }
  destroy() {
    return new Promise(async resolve => {
      this.chatcount = 0;
      this.contents = {text:null,rep:null,file:{name:null,content:null}};
      this.planesend = false;
      this.inpMsg.removeEventListener('input', this.growInput);
      this.downed.clear();
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
    this.setReadChat();
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