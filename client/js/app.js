import modal from "./helper/modal.js";
import xhr from "./helper/xhr.js";

async function checkUser() {
  const isUser = await modal.loading(xhr.get('/uwu/isUser'));
  if(!isUser || isUser.code !== 200) return console.log('TAMPILKAN LOGIN');
  return console.log('JALANKAN DASHBOARD');
}

checkUser();