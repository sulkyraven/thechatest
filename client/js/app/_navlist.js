import Chts from "./Chts.js";
import Find from "./Find.js";

export default [
  { id:'find', text:'<i class="fa-solid fa-magnifying-glass"></i><p>Search</p>', run() {
    new Find().run()
  }},
  { id:'chats', text:'<i class="fa-solid fa-comment"></i><p>Chats</p>', run() {
    new Chts().run();
  }},
  { id:'groups', text:'<i class="fa-solid fa-users"></i><p>Groups</p>', run() {} },
  { id:'calls', text:'<i class="fa-solid fa-phone"></i><p>Calls</p>', run() {} },
  { id:'posts', text:'<i class="fa-solid fa-images"></i><p>Posts</p>', run() {} },
]