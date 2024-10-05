import sdate from "/js/helper/sdate.js";
import validatext from "/js/helper/validatext.js";
import { setbadge } from "/js/manager/badge.js";
import db from "/js/manager/db.js";
import userState from "/js/manager/userState.js";

function profileImage(card, ch, newsrc, oldimg = null) {
  const newImg = new Image();
  newImg.alt = ch.username;
  newImg.width = 50;
  newImg.onerror = () => {
    card.querySelector('.img').innerHTML = `<img src="/assets/${ch.cy===0?'user':'group'}.jpg" alt="${ch.username}" width="50"/>`;
  }
  newImg.onload = () => oldimg?.remove();
  card.querySelector('.img').append(newImg);
  newImg.src = newsrc;
}

function chtsCard(ch) {
  let card = document.getElementById(`kirimin-${ch.id}`);
  let oldUsername = card?.querySelector('.detail .name p').innerText || null;
  if(!card) {
    card = document.createElement('div');
    card.id = `kirimin-${ch.id}`;
    card.classList.add('card');
    card.innerHTML = `
    <div class="left">
      <div class="img"></div>
      <div class="detail">
        <div class="name"><p></p></div>
        <div class="last"></div>
      </div>
    </div>
    <div class="right"></div>`;
  }
  if(ch.username !== oldUsername) {
    const euname = card.querySelector('.detail .name p');
    euname.innerHTML = '';
    euname.append(ch.username);
    if(ch.b) {
      for(const badge of ch.b.sort((a,b) => b - a)) {
        euname.append(setbadge(badge));
      }
    }

  }
  if(ch.img) {
    const oldimg = card.querySelector('.img img');
    const newsrc = `/file/${ch.cy===0?'user':'group'}/${ch.img}`;
    if(!oldimg || !oldimg.src.includes(newsrc)) {
      profileImage(card, ch, newsrc, oldimg);
    }
  } else {
    const oldimg = card.querySelector('.img img');
    const newsrc = `/assets/${ch.cy===0?'user':'group'}.jpg`;
    if(!oldimg) profileImage(card, ch, newsrc);
  }
  const card_a = card.querySelector('.detail .last');
  const card_b = card.querySelector('.right');
  return {card, card_a, card_b};
}
function getEditedMessage() {
  const i = document.createElement('i');
  i.classList.add('edited');
  i.append(userState.langs[userState.lang].CONTENT_EDITED);
  return i;
}

export default {
  ss(txt, n=20, o=0) {
    return (txt.length > n ? txt.substring(o, n - 3) + '...' : txt).trim();
  },
  findCard(ch) {
    const {card, card_a, card_b} = chtsCard({...ch, cy:0});
    // card_a.innerText = ch.bio.length > 20 ? ch.bio.substring(0, 17) + '...' : ch.bio;
    card_a.append(this.ss(ch.bio));
    if(ch.isfriend) card_b.innerHTML = '<div class="btn"><i class="fa-light fa-user-check"></i></div>';
    return card;
  },
  chatCard(ch) {
    let user = null;
    if(ch.code) {
      user = userState.langs[userState.lang].DELETED_USER;
    } else if(ch.id === db.ref.account.id) {
      user = db.ref.account.username;
    } else {
      user = ch.username;
    }

    const {card, card_b} = chtsCard({...ch, username:user, cy:0});

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
      const fileExt = lastObj.i.match(imgExt)?.[1];

      if(validatext.image.includes(fileExt.toLowerCase())) {
        elLastText.innerHTML = '<i class="fa-light fa-image"></i> ';
      } else if(validatext.video.includes(fileExt.toLowerCase())) {
        elLastText.innerHTML = '<i class="fa-light fa-film"></i> ';
      } else {
        elLastText.innerHTML = '<i class="fa-light fa-file"></i> ';
      }
      if(lastObj.txt && lastObj.txt.length > 1) {
        elLastText.append(this.ss(lastObj.txt.replace(/\s/g, ' '), 20));
      } else {
        elLastText.append('Media');
      }
    } else if(lastObj.v) {
      elLastText.innerHTML = '<i class="fa-light fa-microphone"></i> Voice Chat';
    } else {
      elLastText.innerText = this.ss(lastObj.txt.replace(/\s/g, ' '), 20);
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
    // card_a.innerText = ch.bio.length > 20 ? ch.bio.substring(0, 17) + '...' : ch.bio;
    card_a.append(this.ss(ch.bio));
    if(card_b) card_b.remove();
    return card;
  },
  contentCard(ch, chts, conty, temp = false) {
    let card = document.getElementById(`krmn-${ch.id}`);
    let oldUsername = card?.querySelector('.sender .name')?.innerText || null;
    if(ch.u.username && ch.u.id !== db.ref.account.id && ch.u.username !== oldUsername) {
      const euname = card?.querySelector('.sender .name');
      if(euname) {
        euname.innerHTML = '';
        euname.append(ch.u.username);
        const badges = ch.u.b || (ch.u.id === db.ref.account.id && db.ref.account.b) || null;
        if(badges) {
          for(const badge of badges.sort((a,b) => b - a)) {
            euname.append(setbadge(badge));
          }
        }
      }
    }
    if(!card) {
      card = document.createElement('div');
      card.id = `krmn-${ch.id}`;
      card.classList.add('card');
      const lastcard = document.querySelector('.content .mid .chatlist').lastElementChild;
      if(lastcard) {
        const lastSender = lastcard.getAttribute('data-sender');
        if(lastSender && lastSender === (ch.u?.id || null)) card.classList.add('follow');
      }

      let username = null;
      if(ch.u.code) {
        username = `<i class="sw">${userState.langs[userState.lang].DELETED_USER}</i>`;
      } else if(ch.u.id === db.ref.account.id) {
        card.classList.add('me');
        card.setAttribute('data-sender', ch.u.id);
        username = db.ref.account.username;
      } else { 
        card.setAttribute('data-sender', ch.u.id);
        username = ch.u.username;
      } 

      card.innerHTML = `
      ${conty !== 1 ? '<div class="chp sender"><div class="name"></div></div>' : ''}
      ${ch.r ? `<div class="chp embed"><div class="name"></div><div class="msg"><p></p></div></div>` : ''}
      ${ch.i || ch.v ? `<div class="chp attach"></div>` : ''}
      <div class="chp text">
        <p></p>
      </div>
      <div class="chp time">
        <p></p>
      </div>`;
      const eluname = card.querySelector('.sender .name');
      if(eluname) {
        eluname.append(username);
        const badges = ch.u.b || (ch.u.id === db.ref.account.id && db.ref.account.b) || null;
        if(badges) {
          for(const badge of badges.sort((a,b) => b - a)) {
            eluname.append(setbadge(badge));
          }
        }
      }

      if(ch.r) {
        const edb = (conty === 1 ? db.ref.chats.find(k => k.id === chts.id) || [] : db.ref.groups.find(k => k.id === chts.id) || []).chats.find(k => k.id === ch.r);
        card.querySelector('.embed').setAttribute('data-rep', edb.id);
        const embedName = card.querySelector('.embed .name');
        embedName.innerText = edb.u.id === db.ref.account.id ? db.ref.account.username : edb.u.username;
        const embedTxt = card.querySelector('.embed .msg');

        if(edb.i) {
          const splitExt = /\.([a-zA-Z0-9]+)$/;
          const fileExt = edb.i.match(splitExt)?.[1];
  
          if(validatext.image.includes(fileExt.toLowerCase())) {
            embedTxt.innerHTML = '<i class="fa-light fa-image"></i> ';
          } else if(validatext.video.includes(fileExt.toLowerCase())) {
            embedTxt.innerHTML = '<i class="fa-light fa-film"></i> ';
          } else if(validatext.audio.includes(fileExt.toLowerCase())) {
            embedTxt.innerHTML = '<i class="fa-light fa-music"></i> ';
          } else {
            embedTxt.innerHTML = '<i class="fa-light fa-file"></i> ';
          }
          if(edb.txt && edb.txt.length > 1) {
            embedTxt.append(this.ss(edb.txt.replace(/\s/g, ' '), 20));
          } else {
            embedTxt.append('Media');
          }
        } else if(edb.v) {
          embedTxt.innerHTML = '<i class="fa-light fa-microphone"></i> Voice Chat';
        } else {
          embedTxt.innerText = this.ss(edb.txt.replace(/\s/g, ' '), 30);
        }
      }

      const sameDay = sdate.sameday(new Date(Date.now()), new Date(ch.ts));
      const eTimeStamp = card.querySelector('.time p');
      if(sameDay) {
        eTimeStamp.append(sdate.time(ch.ts));
      } else {
        eTimeStamp.append(`${sdate.date(ch.ts)} ${sdate.time(ch.ts)}`);
      }

      if(ch.e) eTimeStamp.prepend(getEditedMessage());

      if(ch.v) {
        card.querySelector('.attach').append(this.audioContentCard(ch, chts, temp));
      } else if(ch.i) {
        const imgExt = /\.([a-zA-Z0-9]+)$/;
        const fileExt = ch.i.match(imgExt)?.[1];

        if(validatext.image.includes(fileExt.toLowerCase())) {
          card.classList.add('long');
          const filesrc = temp ? ch.i.replace(fileExt, '').replace('.', '') : `/file/content/${chts.id}/${ch.i}`;
          card.querySelector('.attach').innerHTML = `<div class="img"></div>`;
          const newImg = new Image();
          card.querySelector('.attach .img').append(newImg);
          newImg.onerror = () => {
            card.classList.remove('long');
            card.querySelector('.attach').innerHTML = `<div class="document" href="${filesrc}"><p></p></div>`;
            card.querySelector('.attach .document p').innerText = temp ? ch.i.replace(fileExt, '').replace('.', '') : ch.i;
            if(temp) {
              URL.revokeObjectURL(ch.i);
            }
          }
          newImg.onload = () => {
            if(temp) {
              URL.revokeObjectURL(ch.i);
            }
          }
          newImg.src = filesrc;
        } else if(validatext.video.includes(fileExt.toLowerCase())) {
          card.classList.add('long');
          const filesrc = temp ? ch.i.replace(fileExt, '').replace('.', '') : `/file/content/${chts.id}/${ch.i}`;
          card.querySelector('.attach').innerHTML = `<div class="img"></div>`;
          const newVideo = document.createElement('video');
          newVideo.controls = true;
          card.querySelector('.attach .img').append(newVideo);
          newVideo.onerror = () => {
            card.classList.remove('long');
            card.querySelector('.attach').innerHTML = `<div class="document" href="${filesrc}"><p></p></div>`;
            card.querySelector('.attach .document p').innerText = temp ? ch.i.replace(fileExt, '').replace('.', '') : ch.i;
            if(temp) {
              URL.revokeObjectURL(ch.i);
            }
          }
          newVideo.onloadeddata = () => {
            if(temp) {
              URL.revokeObjectURL(ch.i);
            }
          }
          newVideo.src = filesrc;
        } else {
          const filesrc = temp ? ch.i.replace(fileExt, '').replace('.', '') : `/file/content/${chts.id}/${ch.i}`;
          card.querySelector('.attach').innerHTML = `<div class="document" href="${filesrc}"><p></p></div>`;
          card.querySelector('.attach .document p').innerText = temp ? ch.i.replace(fileExt, '').replace('.', '') : ch.i;
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

    const oldTimeStamp = card.querySelector('.time p');
    if(ch.e && oldTimeStamp && !oldTimeStamp.querySelector('.edited')) oldTimeStamp.prepend(getEditedMessage());

    if(ch.u.id === db.ref.account.id && conty === 1) {
      const estatus = card?.querySelector('.time p i.fa-regular');
      if(ch.w?.filter(k => k !== db.ref.account.id).length >= 1) {
        if(estatus.classList.contains('fa-check')) {
          estatus.classList.remove('fa-check');
          estatus.classList.add('fa-check-double', 'cy');
        } else if(estatus.classList.contains('fa-clock')) {
          estatus.classList.remove('fa-clock');
          estatus.classList.add('fa-check');
        }
      } else if(estatus.classList.contains('fa-clock')) {
        estatus.classList.remove('fa-clock');
        estatus.classList.add('fa-check');
      }
    }
    return {card,uc:true};
  },
  audioContentCard(ch, chts, temp = false) {
    let isPlaying = false;
    const currtime = Date.now().toString(32);
    const card = document.createElement('div');
    card.classList.add('voice');
    card.innerHTML = `
    <div class="control">
      <div class="btn"></div>
    </div>
    <div class="range">
      <input type="range" name="range_${ch.id}_${currtime}" id="range_${ch.id}_${currtime}" min="0" max="100" value="0" />
    </div>
    <div class="duration">
      <p>-:--</p>
    </div>`;
    const audio = new Audio();
    audio.src = temp ? ch.v : `/file/content/${chts.id}/${ch.v}`;

    const audioControl = card.querySelector('.control .btn');
    const audioDur = card.querySelector('.duration p');
    const audioRange = card.querySelector(`.range #range_${ch.id}_${currtime}`);
    let rangeUpdating = false, audioLoaded = false, audioError = false, audioRevoked = false;

    audio.onerror = () => {
      audioError = true;
      card.classList.remove('voice');
      card.classList.add('document');
      card.innerHTML = `<p></p>`;
      card.querySelector('p').innerText = ch.v;
    }

    audio.onended = () => {
      isPlaying = false;
      if(audioError) return;
      audio.pause();
      audio.currentTime = 0;
      audioControl.classList.remove('playing');
    }
    audio.ontimeupdate = () => {
      if(audioError) return;
      const elExists = document.querySelector(`#range_${ch.id}_${currtime}`);
      if(!elExists) {
        audio.pause();
        audio.currentTime = 0;
        audioControl.classList.remove('playing');
        audio.remove();
      }
      const mm = Math.floor(audio.currentTime / 60);
      const dd = Math.floor(audio.currentTime - (mm * 60));

      audioDur.innerHTML = dd < 10 ? `${mm}:0${dd}` : `${mm}:${dd}`;
      if(!rangeUpdating) audioRange.value = Math.floor((audio.currentTime / audio.duration) * 100);
    }
    audioRange.onmouseup = () => {
      rangeUpdating = false;
      if(audioError) return;
      audio.currentTime = Math.floor((audioRange.value * audio.duration) / 100);
    }
    audioRange.onmousedown = () => rangeUpdating = true;
    audioControl.onclick = () => {
      if(audioError) return;
      if(isPlaying) {
        isPlaying = false;
        audio.pause();
        audioControl.classList.remove('playing');
      } else {
        isPlaying = true;
        audio.play();
        audioControl.classList.add('playing');
        if(temp && !audioRevoked) {
          audioRevoked = true;
          URL.revokeObjectURL(ch.v);
        }
      }
    }
    audio.oncanplay = () => {
      if(audioError) return;
      if(audioLoaded) return;
      if(audio.duration === Infinity || isNaN(Number(audio.duration))) {
        audio.currentTime = 60 * 60 * 6;
        audio.currentTime = 0;
      }
      if(audio.duration !== Infinity && !isNaN(Number(audio.duration))) {
        audioLoaded = true;
        const mm = Math.floor(audio.duration / 60);
        const dd = Math.floor(audio.duration - (mm * 60));
        audioDur.innerHTML = dd < 10 ? `${mm}:0${dd}` : `${mm}:${dd}`;
      }
    }
    return card;
  },
  groupMemberCard(usr, oid) {
    const card = document.createElement('li');
    card.innerHTML = `
    <div class="left">
      <p class="uname">${usr.username} ${usr.id === oid ? '<i class="fa-light fa-user-crown"></i>' : ''}</p>
    </div>
    ${db.ref.account.id === oid && db.ref.account.id !== usr.id ? `<div class="right"><div class="btn btn-kick"><i class="fa-solid fa-circle-x"></i></div></div>` : ''}`;

    const euname = card.querySelector('.left .uname');
    const oldname = euname.innerText || null;
    if(usr.username !== oldname) {
      euname.innerHTML = '';
      euname.append(usr.username);
      if(usr.b) { 
        for(const badge of usr.b.sort((a,b) => b - a)) {
          euname.append(setbadge(badge));
        }
      }
      if(usr.id === oid) {
        const i = document.createElement('i');
        i.classList.add('fa-light', 'fa-user-crown');
        i.title = 'GROUP OWNER';
        euname.append(i);
      }
    }

    const img = new Image();
    img.alt = usr.username;
    img.onerror = () => img.src = '/assets/user.jpg';
    img.src = usr.img?`/file/user/${usr.img}`:'/assets/user.jpg';
    card.querySelector('.left').prepend(img);
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

    let user = null;
    if(lastObj.u.code) {
      user = userState.langs[userState.lang].DELETED_USER;
    } else if(lastObj.u.id === db.ref.account.id) {
      user = db.ref.account.username;
    } else {
      user = lastObj.u.username;
    }

    if(elLastText.getAttribute('id') === `text-$${lastObj.id}`) return {card,uc:true};
    elLastText.id = `text-$${lastObj.id}`;
    if(lastObj.i) {
      const imgExt = /\.([a-zA-Z0-9]+)$/;
      const fileExt = lastObj.i.match(imgExt)?.[1];

      if(validatext.image.includes(fileExt.toLowerCase())) {
        elLastText.innerHTML = '<i class="fa-light fa-image"></i> ';
      } else if(validatext.video.includes(fileExt.toLowerCase())) {
        elLastText.innerHTML = '<i class="fa-light fa-film"></i> ';
      } else {
        elLastText.innerHTML = '<i class="fa-light fa-file"></i> ';
      }
      if(lastObj.txt && lastObj.txt.length > 1) {
        elLastText.append(this.ss((`${user}: ${lastObj.txt}`).replace(/\s/g, ' '), 20));
      } else {
        elLastText.append(this.ss(`${user}: Media`, 20));
      }
    } else if(lastObj.v) {
      elLastText.innerHTML = '<i class="fa-light fa-microphone"></i> ';
      elLastText.append(this.ss(`${user}: Voice Chat`, 20));
    } else {
      elLastText.innerText = this.ss((`${user}: ${lastObj.txt}`).replace(/\s/g, ' '), 20);
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