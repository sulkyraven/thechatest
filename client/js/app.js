import checkuser from "/js/helper/checkuser.js";
import userState from "/js/manager/userState.js";

let lang = {};
for(const k of userState.langs) {
  lang[k] = await fetch(`../json/${k}.json`).then(rs => rs.json()).catch(()=>{});
}
userState.langs = lang;
userState.load();

checkuser();