import pm from "../app/pm.js";
import sign from "../app/sign.js";
import modal from "./modal.js";
import xhr from "./xhr.js";

export default async function() {
  const isUser = await modal.loading(xhr.get('/auth/isUser'));
  if(!isUser || isUser.code !== 200) return new sign().run();
  return new pm().run();
}