import modal from "/js/helper/modal.js";
import sceneIn from "/js/helper/sceneIn.js";
import userState from "/js/manager/userState.js";
let lang = {};

export default class {
  constructor() {
    this.id = 'posts';
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('posts', 'pmb');
    this.el.innerHTML = `
    <div class="posttitle">
      <div class="btn"><i class="fa-solid fa-arrow-left"></i></div>
      <div class="title">POSTS</div>
    </div>
    <div class="postlist">
      <div class="card liked">
        <div class="user">
          <div class="img">
            <img src="./assets/user.jpg" alt="user"/>
          </div>
          <div class="name">
            <div class="dname">Deva Krista Aranda <i class="B dev"></i> <i class="B mod"></i> <i class="B staff"></i> <i class="B verified"></i></div>
            <div class="uname">@dvnkz_</div>
          </div>
        </div>
        <div class="media">
          <img src="./assets/fivem_wp.jpg" alt="fivem"/>
        </div>
        <div class="statistics">
          <div class="btn btn-like">2</div>
          <div class="btn btn-comment">3</div>
        </div>
        <div class="text">
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Esse dolores aut, earum neque, reprehenderit dicta dolorem quod repudiandae quia saepe ex atque eum illo odio sit vitae ullam officiis architecto! Id et necessitatibus velit suscipit quibusdam, a quia repudiandae fugit quas debitis voluptatibus? Quae, veritatis cupiditate? Alias autem laborum cum.</p>
        </div>
        <div class="timestamp">11:12 11/12/24</div>
      </div>
      <div class="card liked">
        <div class="user">
          <div class="img">
            <img src="./assets/user.jpg" alt="user"/>
          </div>
          <div class="name">
            <div class="dname">Deva Krista Aranda <i class="B dev"></i> <i class="B mod"></i> <i class="B staff"></i> <i class="B verified"></i></div>
            <div class="uname">@dvnkz_</div>
          </div>
        </div>
        <div class="media">
          <img src="./assets/fivem_wp.jpg" alt="fivem"/>
        </div>
        <div class="statistics">
          <div class="btn btn-like">2</div>
          <div class="btn btn-comment">3</div>
        </div>
        <div class="text">
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Esse dolores aut, earum neque, reprehenderit dicta dolorem quod repudiandae quia saepe ex atque eum illo odio sit vitae ullam officiis architecto! Id et necessitatibus velit suscipit quibusdam, a quia repudiandae fugit quas debitis voluptatibus? Quae, veritatis cupiditate? Alias autem laborum cum.</p>
        </div>
        <div class="timestamp">11:12 11/12/24</div>
      </div>
    </div>
    <div class="postactions">
      <div class="btn btn-create"><i class="fa-solid fa-plus"></i> Create Post</div>
    </div>`;
  }
  destroy() {
    return new Promise(async resolve => {
      this.el.classList.add('out');
      await modal.waittime();
      this.el.remove();
      this.isLocked = false;
      userState.pmbottom = null;
      resolve();
    });
  }
  async run() {
    userState.pmbottom = this;
    lang = userState.langs[userState.lang];
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    sceneIn(this.el);
  }
}