import db from "../manager/db.js";

export default class {
  constructor() {
    this.isLocked = false;
    this.list = [];
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('chts');
    this.el.innerHTML = `
    <div class="top">
      <div class="title">KIRIMIN</div>
      <div class="actions">
        <div class="btn"><i class="fa-solid fa-magnifying-glass"></i></div>
        <div class="btn"><i class="fa-solid fa-ellipsis-vertical"></i></div>
      </div>
    </div>
    <div class="bottom">
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
  getChatList() {
    this.cardlist = this.el.querySelector('.card-list');

    const ndb = db.ref?.chts || [];
    const odb = this.list || [];

    const fdb = ndb.filter(ch => !odb.map(ch => ch.id).includes(ch.id));
    fdb.forEach(ch => {
      const card = createCard(ch);
      this.cardlist.append(card);
    });
  }
  forceUpdate() {
  }
  run() {
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
  }
}

function createCard(ch) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.innerHTML = `
  <div class="left">
    <div class="img">
      <img src="${ch.img}" alt="user" width="50"/>
    </div>
    <div class="detail">
      <div class="name"><p>${ch.name}</p></div>
      <div class="last">Aowkwk</div>
    </div>
  </div>
  <div class="right">
    <div class="last"></div>
    <div class="unread"></div>
  </div>`;
  const content = db.ref.content.find(ct => ct.id === ch.id);
  const unread = content.filter(ct => ct.unread === true).length;
  const lastObj = content[content.length - 1];
  
  if(unread >= 1) card.querySelector('.right .unread').innerHTML = `<div class="circle">${unread}</div>`;

  const tNow = new Date(Date.now());
  const tOld = new Date(lastObj.ts);

  const sameDay = tNow.getFullYear() === tOld.getFullYear() && tNow.getMonth() === tOld.getMonth() && tNow.getDate() === tOld.getDate();

  if(sameDay) {
    card.querySelector('.right .last').innerText = `${tOld.getHours()}:${tOld.getMinutes()}`;
  } else {
    card.querySelector('.right .last').innerText = `${tOld.getDate()}/${tOld.getMonth()}/${tOld.getFullYear()}`;
  }

  const elLastText = card.querySelector('.detail .last');
  if(lastObj.type === 'img') {
    if(lastObj.text && lastObj.text.length > 1) {
      elLastText.innerHTML = '<i class="fa-light fa-image"></i> ';
      elLastText.innerText += lastObj.text.replace(/\n/g, ' ');
    }
    elLastText.innerHTML = '<i class="fa-light fa-image"></i> Image';
  } else if(lastObj.type === 'file') {
    if(lastObj.text && lastObj.text.length > 1) {
      elLastText.innerHTML = '<i class="fa-light fa-file"></i> ';
      elLastText.innerText += lastObj.text.replace(/\n/g, ' ');
    }
    elLastText.innerHTML = '<i class="fa-light fa-file"></i> Image';
  } else if(lastObj.type === 'voice') {
    elLastText.innerHTML = '<i class="fa-light fa-microphone"></i> Voice Chat';
  } else {
    elLastText.innerText = lastObj.text.replace(/\n/g, ' ');
  }
  return card;
}