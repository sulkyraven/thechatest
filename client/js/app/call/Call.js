import modal from "/js/helper/modal.js";
import xhr from "/js/helper/xhr.js";
import { setbadge } from "/js/manager/badge.js";
import db from "/js/manager/db.js";
import userState from "/js/manager/userState.js";
import * as nrw from "/js/manager/nrw.js";
import cloud from "/js/manager/cloud.js";
import VoiceCall from "/js/app/call/VoiceCall.js";

let currcall = null;

export function checkCall() {
  return currcall ? true : false;
}

function callman(callclass) {
  currcall = callclass;
}

export function SendCall({user}) {
  if(currcall) return;
  new VoiceCall({callman, user}).run();
}

export function ReceiveCall(uid) {
  if(currcall) return;
  const user = db.ref.friends?.find(usr => usr.id === uid) || null;
  if(!user) return;
  new VoiceCall({callman, user}).follow();
}