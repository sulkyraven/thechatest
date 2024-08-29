import db from "../manager/db.js";
import elgen from "../manager/elgen.js";
import userState from "../manager/userState.js";

export default class {
  constructor({group}) {
    this.group = group;
    this.isLocked = false;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('acc');
    this.el.innerHTML = `
    <div class="top flex">
      <div class="left">
        <div class="btn"><i class="fa-solid fa-arrow-left"></i></div>
        <div class="sect-title">Groups</div>
      </div>
      <div class="right">
        <div class="btn"><i class="fa-solid fa-ellipsis-vertical"></i></div>
      </div>
    </div>
    <div class="wall">
      <div class="chp userphoto">
        <div class="outer-img">
          <img src="${this.group.i ? `/img/group/${this.group.id}` : '/assets/group.jpg'}" alt="${this.group.id}"/>
          <div class="btn"><i class="fa-solid fa-pen-to-square"></i></div>
        </div>
      </div>
      <div class="chp groupname">
        <div class="outer">
          <div class="chp-t">Group Name</div>
          <div class="chp-f"><p></p></div>
          <div class="chp-e"><i class="fa-solid fa-pen-to-square"></i> Edit</div>
        </div>
      </div>
      <div class="chp groupid">
        <div class="outer">
          <div class="chp-t">Group ID</div>
          <div class="chp-f"><p></p></div>
        </div>
      </div>
      <div class="chp grouptype">
        <div class="outer">
          <div class="chp-t">Visibility</div>
          <div class="chp-f"><p>Private</p></div>
          <div class="chp-l">
            <select name="sel-lang" id="sel-lang">
              <option value="null">Change Visibility</option>
              <option value="id">Private</option>
              <option value="en">Public</option>
            </select>
          </div>
        </div>
      </div>
      <div class="chp groupmember">
        <div class="outer">
          <div class="chp-t">Members</div>
          <div class="chp-u"><ul></ul></div>
        </div>
      </div>
    </div>`;
    this.gimg = this.el.querySelector('.userphoto .outer-img');
    this.gname = this.el.querySelector('.groupname .chp-f p');
    this.gid = this.el.querySelector('.groupid .chp-f p');
    this.gtype = this.el.querySelector('.grouptype .chp-f p');
    this.gmember = this.el.querySelector('.groupmember .chp-u ul');

  }
  renderDetail() {
    this.gname.innerText = this.group.n;
    this.gid.innerHTML = this.group.id.toUpperCase();
    this.gtype.innerHTML = this.group.t === 1 ? 'Private' : 'Public';
    this.group.u.forEach(usr => {
      const card = elgen.groupMemberCard(usr, this.group.o);
      this.gmember.append(card);
    });
    const scard = elgen.groupMemberCard(db.ref.account, this.group.o);
    this.gmember.prepend(scard);
  }
  btnListener() {
  }
  async run() {
    await userState.pmbottom?.destroy?.();
    userState.pmbottom = this;
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    this.renderDetail();
  }
}