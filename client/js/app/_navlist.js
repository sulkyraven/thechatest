import Find from "./Find.js";
import Chts from "./Chts.js";
import Friends from "./Friends.js";
import Grps from "./Grps.js";

export default [
  { id:'find', text:'<i class="fa-solid fa-magnifying-glass"></i><p>Search</p>', async run() {
    await new Find().run()
  }},
  { id:'chats', text:'<i class="fa-solid fa-comments"></i><p>Chats</p>', async run() {
    await new Chts().run();
  }},
  { id:'friends', text:'<i class="fa-solid fa-address-book"></i><p>Friends</p>', async run() {
    await new Friends().run();
  }},
  { id:'groups', text:'<i class="fa-solid fa-users"></i><p>Groups</p>', async run() {
    await new Grps().run();
  } },
  { id:'calls', text:'<i class="fa-solid fa-phone"></i><p>Calls</p>', async run() {} },
  { id:'posts', text:'<i class="fa-solid fa-images"></i><p>Posts</p>', async run() {} },
]