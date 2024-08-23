import checkuser from "./helper/checkuser.js";
import userState from "./manager/userState.js";

let lang = {};
userState.langs.forEach(async k => {
  lang[k] = await fetch(`../json/${k}.json`).then(rs=>rs.json()).catch(()=>{});
})

userState.langs = lang;

userState.load();

checkuser();