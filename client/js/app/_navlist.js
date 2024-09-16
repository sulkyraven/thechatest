import Find from "./Find.js";
import Chts from "./Chts.js";
import Friends from "./Friends.js";
import Grps from "./Grps.js";
import userState from "../manager/userState.js";
import Empty from "./Empty.js";

export default [
  { id:'find', text:'<i class="fa-solid fa-magnifying-glass"></i><p>Search</p>', async run() {
    if(userState.locked.mid) return;
    userState.locked.mid = true;
    await userState.pmmid?.destroy?.();
    await new Find().run();
    userState.locked.mid = false;
  }},
  { id:'chats', text:'<i class="fa-solid fa-comments"></i><p>Chats</p>', async run() {
    if(userState.locked.mid) return;
    userState.locked.mid = true;
    await userState.pmmid?.destroy?.();
    await new Chts().run();
    userState.locked.mid = false;
  }},
  { id:'friends', text:'<i class="fa-solid fa-address-book"></i><p>Friends</p>', async run() {
    if(userState.locked.mid) return;
    userState.locked.mid = true;
    await userState.pmmid?.destroy?.();
    await new Friends().run();
    userState.locked.mid = false;
  }},
  { id:'groups', text:'<i class="fa-solid fa-users"></i><p>Groups</p>', async run() {
    if(userState.locked.mid) return;
    userState.locked.mid = true;
    await userState.pmmid?.destroy?.();
    await new Grps().run();
    userState.locked.mid = false;
  } },
  { id:'calls', text:'<i class="fa-solid fa-phone"></i><p>Calls</p>', async run() {
    if(userState.locked.mid) return;
    userState.locked.mid = true;
    await userState.pmmid?.destroy?.();
    userState.locked.mid = false;
  } },
  { id:'posts', text:'<i class="fa-solid fa-images"></i><p>Posts</p>', async run() {
    if(userState.locked.mid) return;
    userState.locked.mid = true;
    await userState.pmmid?.destroy?.();
    userState.locked.mid = false;
  } },
]