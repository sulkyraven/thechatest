import db from "./db.js";

function chtsCard(ch) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.innerHTML = `
  <div class="left">
    <div class="img">
      <img src="${ch.img ? `/file/${ch.cy===0?'user':'group'}/${ch.id}` : `/assets/${ch.cy===0?'user':'group'}.jpg`}" alt="${ch.username}" alt="user" width="50"/>
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
    const {card, card_a, card_b} = chtsCard({...ch, cy:0});
    card_a.innerText = ch.bio.length > 20 ? ch.bio.substring(0, 17) + '...' : ch.bio;
    if(ch.isfriend) card_b.innerHTML = '<div class="btn"><i class="fa-light fa-user-check"></i></div>';
    return card;
  },
  chatCard(ch) {
    const {card, card_b} = chtsCard({...ch, cy:0});
    card_b.innerHTML = `<div class="last"></div><div class="unread"></div>`;

    const content = db.ref.chats?.find(ct => ct.users.find(k => k.id === ch.id)).chats;
    const unread = content.filter(ct => ct.unread === true && ct.u !== db.ref.account.id).length;
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
    if(lastObj.i) {
      const imgExt = /\.([a-zA-Z0-9]+)$/;
      const fileExt = lastObj.i.match(imgExt)[1];

      if(['gif', 'jpg', 'jpeg', 'png', 'webp'].includes(fileExt.toLowerCase())) {
        elLastText.innerHTML = '<i class="fa-light fa-image"></i> ';
      } else {
        elLastText.innerHTML = '<i class="fa-light fa-file"></i> ';
      }
      if(lastObj.txt && lastObj.txt.length > 1) {
        elLastText.append(txtSS(lastObj.txt.replace(/\s/g, ' '), 20));
      } else {
        elLastText.append('Media');
      }
    } else if(lastObj.v) {
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
  contentCard(ch, chts, conty) {
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
    ${conty !== 1 ? `<div class="chp sender"><div class="name">${username}</div></div>` : ''}
    ${ch.i ? `<div class="chp attach"></div>` : ''}
    ${ch.txt ? `<div class="chp text">
      <p></p>
    </div>` : ''}
    <div class="chp time">
      <p>${new Date(ch.ts).toLocaleString()} ${!ch.unread && ch.u === db.ref.account.id ? '<i class="fa-regular fa-envelope-open"></i>' : ''}</p>
    </div>`;

    if(ch.i) {
      const imgExt = /\.([a-zA-Z0-9]+)$/;
      const fileExt = ch.i.match(imgExt)[1];

      if(['gif', 'jpg', 'jpeg', 'png', 'webp'].includes(fileExt.toLowerCase())) {
        card.querySelector('.attach').innerHTML = `<div class="img"></div>`;
        const newImg = new Image();
        newImg.src = `/file/content/${chts.id}/${ch.i}`;
        card.querySelector('.attach .img').append(newImg);
        newImg.onload = () => card.classList.add('long');
        newImg.onerror = () => {
          card.querySelector('.attach').innerHTML = `<div class="document"><p></p></div>`;
          card.querySelector('.attach .document p').innerText = ch.i;
        }
      } else {
        card.querySelector('.attach').innerHTML = `<div class="document"><p></p></div>`;
        card.querySelector('.attach .document p').innerText = ch.i;
      }
    }

    if(ch.txt) {
      const chTxt = card.querySelector('.chp.text p');
      chTxt.innerText = ch.txt;
    }

    return card;
  },
  groupMemberCard(usr, oid) {
    const card = document.createElement('li');
    card.innerHTML = `
    <div class="left">
      <img src="${usr.img?`/file/user/${usr.id}`:'/assets/user.jpg'}" alt="${usr.username}"/>
      <p class="uname">${usr.username} ${usr.id === oid ? '<i class="fa-light fa-user-crown"></i>' : ''}</p>
    </div>
    ${db.ref.account.id === oid && db.ref.account.id !== usr.id ? `<div class="right"><div class="btn btn-kick"><i class="fa-solid fa-circle-x"></i></div></div>` : ''}`;
    return card;
  },
  groupCard(ch) {
    const {card, card_b} = chtsCard({username:ch.n, id:ch.id, img:ch.i||null, cy:1});
    card_b.innerHTML = `<div class="last"></div><div class="unread"></div>`;

    const content = db.ref.groups?.find(ct => ct.id === ch.id).chats;
    const unread = content.filter(ct => ct.unread === true && ct.u !== db.ref.account.id).length;
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
    const user = lastObj.u === db.ref.account.id ? db.ref.account.username : ch.users.find(k => {
      return k.id === lastObj.u;
    }).username;
    if(lastObj.i) {
      const imgExt = /\.([a-zA-Z0-9]+)$/;
      const fileExt = lastObj.i.match(imgExt)[1];

      if(['gif', 'jpg', 'jpeg', 'png', 'webp'].includes(fileExt.toLowerCase())) {
        elLastText.innerHTML = '<i class="fa-light fa-image"></i> ';
      } else {
        elLastText.innerHTML = '<i class="fa-light fa-file"></i> ';
      }
      if(lastObj.txt && lastObj.txt.length > 1) {
        elLastText.append(txtSS((`${user}: ${lastObj.txt}`).replace(/\s/g, ' '), 20));
      } else {
        elLastText.append(txtSS((`${user}: Media`).replace(/\s/g, ' '), 20));
      }
    } else if(lastObj.v) {
      elLastText.innerHTML = '<i class="fa-light fa-microphone"></i> Voice Chat';
    } else {
      elLastText.innerText = txtSS((`${user}: ${lastObj.txt}`).replace(/\s/g, ' '), 20);
    }
    return card;
  },
}