import sdate from "../helper/sdate.js";
import validatext from "../helper/validatext.js";
import db from "./db.js";
import userState from "./userState.js";

function chtsCard(ch) {
  let card = document.getElementById(`kirimin-${ch.id}`);
  let oldUsername = card?.querySelector('.detail .name p').innerText || null;
  if(!card) {
    card = document.createElement('div');
    card.id = `kirimin-${ch.id}`;
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
  }
  if(ch.username !== oldUsername) {
    const euname = card.querySelector('.detail .name p');
    euname.innerText = ch.username;
  }
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
    const unread = content.filter(ct => ct.u.id !== db.ref.account.id && !ct.w?.includes(db.ref.account.id)).length;
    const lastObj = content[content.length - 1];
    if(!lastObj) {
      if(document.getElementById(`kirimin-${ch.id}`)) return {card,uc:true};
      return {card};
    }
    if(unread >= 1) card.querySelector('.right .unread').innerHTML = `<div class="circle">${unread}</div>`;
    if(unread < 1) card.querySelector('.right .unread .circle')?.remove();

    const sameDay = sdate.sameday(new Date(Date.now()), new Date(lastObj.ts));
    const eTimeStamp = card.querySelector('.right .last');
    if(sameDay) {
      eTimeStamp.innerText = sdate.time(lastObj.ts);
    } else {
      eTimeStamp.innerText = sdate.date(lastObj.ts);
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

    if(lastObj.u.id === db.ref.account.id) {
      if(elLastText.getAttribute('id') === `text-$${lastObj.id}`) {
        if(elLastText.querySelector('.fa-check') && lastObj.w?.filter(k => k !== db.ref.account.id).length < 1) return {card,uc:true};
      }
      const readStatus = document.createElement('i');
      readStatus.classList.add('fa-regular');
      if(!lastObj.w || lastObj.w.filter(k => k !== db.ref.account.id).length < 1) {
        readStatus.classList.add('fa-check');
      } else {
        readStatus.classList.add('fa-check-double');
      }
      elLastText.prepend(readStatus, ' ');
    }

    elLastText.id = `text-$${lastObj.id}`;

    return {card};
  },
  friendCard(ch) {
    const {card, card_a, card_b} = chtsCard({...ch, cy:0});
    card_a.innerText = ch.bio.length > 20 ? ch.bio.substring(0, 17) + '...' : ch.bio;
    if(card_b) card_b.remove();
    return card;
  },
  contentCard(ch, chts, conty) {
    let card = document.getElementById(`krmn-${ch.id}`);
    let oldUsername = card?.querySelector('.sender .name')?.innerText || null;
    if(ch.u.id !== db.ref.account.id && ch.u.username !== oldUsername) {
      const euname = card?.querySelector('.sender .name');
      if(euname) euname.innerText = ch.u.username;
    }
    if(!card) {
      card = document.createElement('div');
      card.id = `krmn-${ch.id}`;
      card.classList.add('card');

      let username = null;
      if(ch.u.code) {
        username = `<i class="sw">${userState.langs[userState.lang].DELETED_USER}</i>`;
      } else if(ch.u.id === db.ref.account.id) {
        card.classList.add('me');
        username = db.ref.account.username;
      } else { 
        username = ch.u.username;
      }
      card.innerHTML = `
      ${conty !== 1 ? `<div class="chp sender"><div class="name">${username}</div></div>` : ''}
      ${ch.r ? `<div class="chp embed"><div class="name">Bukan Devanka</div><div class="msg"><p><i class="fa-solid fa-image"></i> Ini pesan yang dibalas</p></div></div>` : ''}
      ${ch.i ? `<div class="chp attach"></div>` : ''}
      <div class="chp text">
        <p></p>
      </div>
      <div class="chp time">
        <p></p>
      </div>`;

      if(ch.r) {
        const edb = (conty === 1 ? db.ref.chats.find(k => k.id === chts.id) || [] : db.ref.groups.find(k => k.id === chts.id) || []).chats.find(k => k.id === ch.r);
        card.querySelector('.embed').setAttribute('data-rep', edb.id);
        const embedName = card.querySelector('.embed .name');
        embedName.innerText = edb.u.id === db.ref.account.id ? db.ref.account.username : edb.u.username;
        const embedTxt = card.querySelector('.embed .msg');

        if(edb.i) {
          const splitExt = /\.([a-zA-Z0-9]+)$/;
          const fileExt = edb.i.match(splitExt)[1];
  
          if(validatext.image.includes(fileExt.toLowerCase())) {
            embedTxt.innerHTML = '<i class="fa-light fa-image"></i> ';
          } else if(validatext.video.includes(fileExt.toLowerCase())) {
            embedTxt.innerHTML = '<i class="fa-light fa-video"></i> ';
          } else if(validatext.audio.includes(fileExt.toLowerCase())) {
            embedTxt.innerHTML = '<i class="fa-light fa-music"></i> ';
          } else {
            embedTxt.innerHTML = '<i class="fa-light fa-file"></i> ';
          }
          if(edb.txt && edb.txt.length > 1) {
            embedTxt.append(txtSS(edb.txt.replace(/\s/g, ' '), 20));
          } else {
            embedTxt.append('Media');
          }
        } else if(edb.v) {
          embedTxt.innerHTML = '<i class="fa-light fa-microphone"></i> Voice Chat';
        } else {
          embedTxt.innerText = txtSS(edb.txt.replace(/\s/g, ' '), 30);
        }
      }

      const sameDay = sdate.sameday(new Date(Date.now()), new Date(ch.ts));
      const eTimeStamp = card.querySelector('.time p');
      if(sameDay) {
        eTimeStamp.innerText = sdate.time(ch.ts);
      } else {
        eTimeStamp.innerText = `${sdate.date(ch.ts)} ${sdate.time(ch.ts)}`;
      }

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

      if(ch.u.id === db.ref.account.id && conty === 1) {
        if(!ch.w || ch.w.filter(k => k !== db.ref.account.id).length < 1) {
          eTimeStamp.innerHTML += ' <i class="fa-regular fa-check"></i>';
        } else {
          eTimeStamp.innerHTML += ' <i class="fa-regular fa-check-double cy"></i>';
        }
      }

      if(ch.txt) {
        const chTxt = card.querySelector('.chp.text p');
        chTxt.innerText = ch.txt;
      }
      return {card};
    }

    if(ch.u.id === db.ref.account.id && conty === 1) {
      const estatus = card?.querySelector('.time p i');
      if(ch.w?.filter(k => k !== db.ref.account.id).length >= 1 && estatus.classList.contains('fa-check')) {
        estatus.classList.remove('fa-check');
        estatus.classList.add('fa-check-double', 'cy')
      }
    }
    return {card,uc:true};
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
    const unread = content.filter(ct => ct.u.id !== db.ref.account.id && !ct.w?.includes(db.ref.account.id)).length;
    const lastObj = content[content.length - 1];
    if(!lastObj) {
      if(document.getElementById(`kirimin-${ch.id}`)) return {card,uc:true};
      return {card};
    }
    if(unread >= 1) card.querySelector('.right .unread').innerHTML = `<div class="circle">${unread}</div>`;
    if(unread < 1) card.querySelector('.right .unread .circle')?.remove();
  
    const sameDay = sdate.sameday(new Date(Date.now()), new Date(lastObj.ts));
    const eTimeStamp = card.querySelector('.right .last');
    if(sameDay) {
      eTimeStamp.innerText = sdate.time(lastObj.ts);
    } else {
      eTimeStamp.innerText = sdate.date(lastObj.ts);
    }

    const elLastText = card.querySelector('.detail .last');
    const user = lastObj.u.id === db.ref.account.id ? db.ref.account.username : lastObj.u.username;
    if(elLastText.getAttribute('id') === `text-$${lastObj.id}`) return {card,uc:true};
    elLastText.id = `text-$${lastObj.id}`;
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
    return {card};
  },
  delCard() {
    for(const arg of arguments) {
      const card = document.getElementById(`kirimin-${arg}`);
      if(card) card.remove();
    }
  }
}