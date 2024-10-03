import Find from "/js/app/pmm/Find.js";
import Chats from "/js/app/pmm/Chats.js";
import Friends from "/js/app/pmm/Friends.js";
import Grps from "/js/app/pmm/Grps.js";
import userState from "/js/manager/userState.js";
import Empty from "/js/app/pmb/Empty.js";
import Posts from "/js/app/pmb/Posts.js";
import Calls from "/js/app/pmm/Calls.js";

export default [
  { id:'find', text:'<i class="fa-solid fa-magnifying-glass"></i><p>Search</p>', async run() {
    if(userState.locked.mid) return;
    userState.locked.mid = true;
    await userState.pmmid?.destroy?.();
    new Find().run();
    userState.locked.mid = false;
  }},
  { id:'chats', text:'<i class="fa-solid fa-comments"></i><p>Chats</p>', async run() {
    if(userState.locked.mid) return;
    userState.locked.mid = true;
    await userState.pmmid?.destroy?.();
    new Chats().run();
    userState.locked.mid = false;
  }},
  { id:'friends', text:'<i class="fa-solid fa-address-book"></i><p>Friends</p>', async run() {
    if(userState.locked.mid) return;
    userState.locked.mid = true;
    await userState.pmmid?.destroy?.();
    new Friends().run();
    userState.locked.mid = false;
  }},
  { id:'groups', text:'<i class="fa-solid fa-users"></i><p>Groups</p>', async run() {
    if(userState.locked.mid) return;
    userState.locked.mid = true;
    await userState.pmmid?.destroy?.();
    new Grps().run();
    userState.locked.mid = false;
  } },
  { id:'calls', text:'<i class="fa-solid fa-phone"></i><p>Calls</p>', async run() {
    if(userState.locked.mid) return;
    userState.locked.mid = true;
    await userState.pmmid?.destroy?.();
    new Calls().run();
    userState.locked.mid = false;
  } },
  { id:'posts', text:'<i class="fa-solid fa-camera-polaroid"></i><p>Posts</p>', async run() {
    if(userState.locked.bottom) return;
    userState.locked.bottom = true;
    await userState.pmbottom?.destroy?.();
    new Posts().run();
    userState.locked.bottom = false;
  }, noactive: true },
]