import Empty from "/js/app/pmb/Empty.js";
import userState from "/js/manager/userState.js";

const bottomclasses = ['account', 'content', 'group_setting', 'posts', 'profile'];
const topclasses = ['calls', 'chats', 'friends', 'groups', 'find'];

export let isNarrow = false;
export let queue = [];

function onresize() {
  if(window.innerWidth <= 850) {
    if(!isNarrow) {
      isNarrow = true;
      if(bottomclasses.includes(userState.pmlast)) {
        setQueue();
        fRemovePM();
        destroyPM();
      } else if(topclasses.includes(userState.pmlast)) {
        if(userState.pmbottom) queue.push(userState.pmbottom);
        userState.pmbottom?.fRemove?.();
        userState.pmbottom?.destroy?.();
      }
    }
  } else {
    if(isNarrow) {
      isNarrow = false;
      const pmlist = [userState.pmbottom?.id, userState.pmmid?.id, userState.pmtop?.id, userState.pmtitle?.id];

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

export function fRemovePM() {
  userState.pmtitle?.fRemove?.();
  userState.pmtop?.fRemove?.();
  userState.pmmid?.fRemove?.();
}
export async function destroyPM() {
  userState.pmtitle?.destroy?.();
  userState.pmtop?.destroy?.();
  await userState.pmmid?.destroy?.();
}
export function setQueue() {
  queue = [];
  if(userState.pmmid) queue.push(userState.pmmid);
  if(userState.pmtop) queue.push(userState.pmtop);
  if(userState.pmtitle) queue.push(userState.pmtitle);
}
export function setEmpty() {
  queue = [];
  queue.push(new Empty());
}
export function runQueue() {
  const pmlist = [userState.pmbottom?.id, userState.pmmid?.id, userState.pmtop?.id, userState.pmtitle?.id];

  for(const cls of queue) {
    if(!pmlist.includes(cls.id)) cls.run();
  }

  queue = [];
}
export function windowresize() {
  if(window.innerWidth <= 850) isNarrow = true;
  window.addEventListener('resize', onresize);
}