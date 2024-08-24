import pm from "../app/pm.js";
import sign from "../app/sign.js";
import cloud from "../manager/cloud.js";
import modal from "./modal.js";
import xhr from "./xhr.js";

export default async function() {
  const isUser = await modal.loading(xhr.get('/auth/isUser'));
  if(!isUser || isUser.code !== 200) return new sign().run();
  cloud.run(isUser.data.find(ls => ls.name === 'peers').data);
  isUser.data.forEach(obj => cloud.clientData(obj));
  return new pm().run();
}

// setiap ada yang baru online, bikin request dapetin peer lagi