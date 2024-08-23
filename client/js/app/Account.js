import userState from "../manager/userState.js";

export default class {
  constructor() {}
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('acc');
    this.el.innerHTML = `
    <div class="top">
      <div class="btn"><i class="fa-solid fa-arrow-left"></i></div>
      <div class="sect-title">Settings</div>
    </div>
    <div class="wall">
      <div class="chp userphoto">
        <div class="outer-img">
          <img src="./assets/user.jpg" alt="user" width="150" />
          <div class="btn"><i class="fa-solid fa-pen-to-square"></i></div>
        </div>
      </div>
      <div class="chp userid">
        <div class="outer">
          <div class="chp-t">ID</div>
          <div class="chp-f"><p>761761</p></div>
        </div>
      </div>
      <div class="chp username">
        <div class="outer">
          <div class="chp-t">Username</div>
          <div class="chp-f"><p>@dvnkz_</p></div>
          <div class="chp-e"><i class="fa-solid fa-pen-to-square"></i> Edit</div>
        </div>
      </div>
      <div class="chp userdisplayname">
        <div class="outer">
          <div class="chp-t">Display Name</div>
          <div class="chp-f"><p>Deva Krista Aranda</p></div>
          <div class="chp-e"><i class="fa-solid fa-pen-to-square"></i> Edit</div>
        </div>
      </div>
      <div class="chp userbio">
        <div class="outer">
          <div class="chp-t">About</div>
          <div class="chp-f">
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Molestiae nisi odio id veniam reprehenderit earum praesentium animi quam, expedita similique?</p>
          </div>
          <div class="chp-e"><i class="fa-solid fa-pen-to-square"></i> Edit</div>
        </div>
      </div>
      <div class="chp useremail">
        <div class="outer">
          <div class="chp-t">Email</div>
          <div class="chp-f"><p>contoh@example.com</p></div>
          <div class="chp-n"><p>*other user cannot see this information</p></div>
        </div>
      </div>
      <div class="chp userlang">
        <div class="outer">
          <div class="chp-t">Language</div>
          <div class="chp-f"><p>Bahasa Indonesia</p></div>
          <div class="chp-l">
            <select name="sel-lang" id="sel-lang">
              <option value="null">Change Language</option>
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
      <div class="chp usersign">
        <p><a href="/auth/logout"><i class="fa-light fa-triangle-exclamation"></i> LOG OUT</a></p>
      </div>
    </div>`;
  }
  destroy() {
    this.el.remove();
    userState.pmbottom = null;
  }
  run() {
    userState.pmbottom = this;
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
  }
}