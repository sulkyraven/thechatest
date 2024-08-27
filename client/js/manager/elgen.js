import db from "./db.js";

function contentCard(ch) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.innerHTML = `
  <div class="left">
    <div class="img">
      <img src="${ch.img ? `/img/user/${ch.id}` : '/assets/user.jpg'}" alt="${ch.username}" alt="user" width="50"/>
    </div>
    <div class="detail">
      <div class="name"><p>${ch.username}</p></div>
      <div class="last"></div>
    </div>
  </div>
  <div class="right"></div>`;
  const card_a = card.querySelector('.detail .last');
  const card_b = card.querySelector('.right');
  return {card, card_a, card_b};
}

export default {
  findCard(ch) {
    const {card, card_a, card_b} = contentCard(ch);
    card_a.innerText = ch.bio.length > 20 ? ch.bio.substring(0, 17) + '...' : ch.bio;
    const friend = db.ref.friends?.find(fr => fr.id === ch.id) || null;
    if(friend) card_b.innerHTML = '<div class="btn"><i class="fa-light fa-user-check"></i></div>';
    return card;
  },
  chatCard(ch) {
    const {card, card_b} = contentCard(ch);
    card_b.innerHTML = `<div class="last"></div><div class="unread"></div>`;

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
  }
}