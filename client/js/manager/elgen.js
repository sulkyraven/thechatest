import db from "./db.js";

function chtsCard(ch) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.innerHTML = `
  <div class="left">
    <div class="img">
      <img src="${ch.img ? `/img/user/${ch.id}` : (ch.cy===0?'/assets/user.jpg':'/assets/group.jpg')}" alt="${ch.username}" alt="user" width="50"/>
    </div>
    <div class="detail">
      <div class="name"><p></p></div>
      <div class="last"></div>
    </div>
  </div>
  <div class="right"></div>`;
  const euname = card.querySelector('.detail .name p');
  euname.innerText = ch.username;
  const card_a = card.querySelector('.detail .last');
  const card_b = card.querySelector('.right');
  return {card, card_a, card_b};
}
function txtSS(txt, n = 100) {
  return txt.length > 20 ? txt.substring(0, 17) + '...' : txt;
}

export default {
  findCard(ch) {
    const {card, card_a, card_b} = chtsCard(ch);
    card_a.innerText = ch.bio.length > 20 ? ch.bio.substring(0, 17) + '...' : ch.bio;
    if(ch.isfriend) card_b.innerHTML = '<div class="btn"><i class="fa-light fa-user-check"></i></div>';
    return card;
  },
  chatCard(ch) {
    const {card, card_b} = chtsCard({...ch, cy:0});
    card_b.innerHTML = `<div class="last"></div><div class="unread"></div>`;

    const content = db.ref.chats?.find(ct => ct.users.find(k => k.id === ch.id)).chats;
    const unread = content.filter(ct => ct.unread === true).length;
    const lastObj = content[content.length - 1];
    if(!lastObj) return card;
    
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
      if(lastObj.txt && lastObj.txt.length > 1) {
        elLastText.innerHTML = '<i class="fa-light fa-image"></i> ';
        elLastText.innerText += txtSS(lastObj.txt.replace(/\s/g, ' '), 20);
      }
      elLastText.innerHTML = '<i class="fa-light fa-image"></i> Image';
    } else if(lastObj.type === 'file') {
      if(lastObj.txt && lastObj.txt.length > 1) {
        elLastText.innerHTML = '<i class="fa-light fa-file"></i> ';
        elLastText.innerText += txtSS(lastObj.txt.replace(/\s/g, ' '), 20);
      }
      elLastText.innerHTML = '<i class="fa-light fa-file"></i> Image';
    } else if(lastObj.type === 'voice') {
      elLastText.innerHTML = '<i class="fa-light fa-microphone"></i> Voice Chat';
    } else {
      elLastText.innerText = txtSS(lastObj.txt.replace(/\s/g, ' '), 20);
    }
    return card;
  },
  friendCard(ch) {
    const {card, card_a, card_b} = chtsCard({...ch, cy:0});
    card_a.innerText = ch.bio.length > 20 ? ch.bio.substring(0, 17) + '...' : ch.bio;
    card_b.remove();
    return card;
  },
  contentCard(ch, chts) {
    const card = document.createElement('div');
    card.classList.add('card');
    let username = null;
    if(ch.u === db.ref.account.id) {
      card.classList.add('me');
      username = db.ref.account.username;
    } else {
      username = chts.users.find(k => k.id === ch.u).username;
    }
    card.innerHTML = `
    ${chts.users.length > 2 ? `<div class="chp sender"><div class="name">${username}</div></div>` : ''}
    <div class="chp text">
      <p>lorem ipsum</p>
    </div>
    <div class="chp time">
      <p>11:12 11/12/2024</p>
    </div>`;

    const chTxt = card.querySelector('.chp.text p');
    chTxt.innerText = ch.txt;
    if(ch.txt.includes('\n')) {
      const textlongest = ch.txt.split('\n').sort((a,b) => b.length - a.length)[0];
      if(textlongest.length < 33) card.classList.add('short');
    } else {
      if(ch.txt.length < 33) card.classList.add('short');
    }

    return card;
  },
  groupMemberCard(usr, oid) {
    const card = document.createElement('li');
    card.innerHTML = `
    <div class="left">
      <img src="${usr.img?`/img/user/${usr.id}`:'/assets/user.jpg'}" alt="${usr.username}"/>
      <p class="uname">${usr.username} ${usr.id === oid ? '<i class="fa-light fa-user-crown"></i>' : ''}</p>
    </div>
    ${db.ref.account.id === oid && db.ref.account.id !== usr.id ? `<div class="right"><div class="btn btn-kick"><i class="fa-solid fa-circle-x"></i></div></div>` : ''}`;
    return card;
  },
  groupCard(ch) {
    const {card, card_b} = chtsCard({username:ch.n, id:ch.id, img:ch.i||null, cy:1});
    card_b.innerHTML = `<div class="last"></div><div class="unread"></div>`;

    const content = db.ref.groups?.find(ct => ct.id === ch.id).chats;
    const unread = content.filter(ct => ct.unread === true).length;
    const lastObj = content[content.length - 1];
    if(!lastObj) return card;

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
    const user = lastObj.u === db.ref.account.id ? db.ref.account.username : ch.u.find(k => {
      return k.id === lastObj.u;
    }).username;
    if(lastObj.type === 'img') {
      if(lastObj.txt && lastObj.txt.length > 1) {
        elLastText.innerHTML = '<i class="fa-light fa-image"></i> ';
        elLastText.innerText += txtSS((`${user}: ${lastObj.txt}`).replace(/\s/g, ' '), 20);
      }
      elLastText.innerHTML = '<i class="fa-light fa-image"></i> Image';
    } else if(lastObj.type === 'file') {
      if(lastObj.txt && lastObj.txt.length > 1) {
        elLastText.innerHTML = '<i class="fa-light fa-file"></i> ';
        elLastText.innerText += txtSS((`${user}: ${lastObj.txt}`).replace(/\s/g, ' '), 20);
      }
      elLastText.innerHTML = '<i class="fa-light fa-file"></i> Image';
    } else if(lastObj.type === 'voice') {
      elLastText.innerHTML = '<i class="fa-light fa-microphone"></i> Voice Chat';
    } else {
      elLastText.innerText = txtSS((`${user}: ${lastObj.txt}`).replace(/\s/g, ' '), 20);
    }
    return card;
  },
}