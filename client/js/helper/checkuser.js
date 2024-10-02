import pm from "/js/app/main/pm.js";
import sign from "/js/app/main/sign.js";
import cloud from "/js/manager/cloud.js";
import modal from "/js/helper/modal.js";
import xhr from "/js/helper/xhr.js";

export default async function() {
  const isUser = await modal.loading(xhr.get('/auth/isUser'));
  if(!isUser || isUser.code !== 200) return new sign().run();
  cloud.run(isUser.data.find(ls => ls.name === 'peersinit').data);
  isUser.data.forEach(obj => cloud.clientData(obj));
  return new pm().run();
}

// setiap ada yang baru online, bikin request dapetin peer lagi