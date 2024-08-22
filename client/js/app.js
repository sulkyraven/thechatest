import Sign from "./app/sign.js";
import modal from "./helper/modal.js";
import xhr from "./helper/xhr.js";
import userState from "./manager/userState.js";

let lang = {};
userState.langs.forEach(async k => {
  lang[k] = await fetch(`../json/${k}.json`).then(rs=>rs.json()).catch(()=>{});
})

userState.langs = lang;

userState.load();

async function checkUser() {
  const isUser = await modal.loading(xhr.get('/auth/isUser'));
  if(!isUser || isUser.code !== 200) return new Sign().run();
  return console.log('JALANKAN DASHBOARD');
}

checkUser();