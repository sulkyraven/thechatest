import userState from "/js/manager/userState.js";

const bottomclasses = ['account', 'content', 'group_setting', 'posts', 'profile'];
const topclasses = ['calls', 'chats', 'friends', 'groups', 'find'];

let isNarrow = false;
let queue = [];

function onresize() {
  if(window.innerWidth <= 850) {
    if(!isNarrow) {
      isNarrow = true;
      if(bottomclasses.includes(userState.pmlast)) {
        // if(userState.pmmid) userState.pmqueue = userState.pmmid;
        if(userState.pmmid) queue.push(userState.pmmid, userState.pmtop, userState.pmtitle);
        userState.pmtitle?.fRemove?.();
        userState.pmtitle?.destroy?.();
        userState.pmtop?.fRemove?.();
        userState.pmtop?.destroy?.();
        userState.pmmid?.fRemove?.();
        userState.pmmid?.destroy?.();
      } else if(topclasses.includes(userState.pmlast)) {
        // if(userState.pmbottom) userState.pmqueue = userState.pmbottom;
        if(userState.pmbottom) queue.push(userState.pmbottom);
        userState.pmbottom?.fRemove?.();
        userState.pmbottom?.destroy?.();
      }
    }
  } else {
    if(isNarrow) {
      isNarrow = false;
      const pmlist = [userState.pmbottom?.id, userState.pmmid?.id, userState.pmtop?.id, userState.pmtitle?.id]
      // if(userState.pmqueue?.id === userState.pmbottom?.id) return;
      // if(userState.pmqueue?.id === userState.pmmid?.id) return;

      // if(queue.map(cls => cls.id).includes(userState.pmbottom?.id)) return;
      // if(queue.map(cls => cls.id).includes(userState.pmmid?.id)) return;
      // if(queue.map(cls => cls.id).includes(userState.pmtop?.id)) return;
      // if(queue.map(cls => cls.id).includes(userState.pmtitle?.id)) return;

      let makelast = null;
      if(userState.pmbottom?.id) {
        makelast = userState.pmbottom.id;
      } else if(userState.pmmid?.id) {
        makelast = userState.pmmid.id;
      }

      for(const cls of queue) {
        if(!pmlist.includes(cls.id)) cls.run();
      }

      userState.pmlast = makelast;
      queue = [];
    }
  }
}

export default function() {
  window.addEventListener('resize', onresize);
}