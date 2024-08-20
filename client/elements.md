# KIRIMIN ELEMENTS

## PM
### PM - OUTER
```html
<div class="fuwi pm">
  <div class="nav"></div>
  <div class="list"></div>
  <div class="content"></div>
</div>
```

### PM - NAV
```html
<div class="nav">
  <div role="button" class="btn">
    <i class="fa-solid fa-comment"></i>
    <p>Chats</p>
  </div>
  <div role="button" class="btn">
    <i class="fa-solid fa-phone"></i>
    <p>Calls</p>
  </div>
</div>
```

### PM - LIST
```html
<div class="list">
  <div class="top">
    <div class="title">KIRIMIN</div>
    <div class="actions">
      <div class="btn"><i class="fa-solid fa-magnifying-glass"></i></div>
      <div class="btn"><i class="fa-solid fa-ellipsis-vertical"></i></div>
    </div>
  </div>
  <div class="bottom">
    <div class="search">
      <input type="text" name="card-input" id="card-input" placeholder="Type Here" />
    </div>
    <div class="card-list">
      <div class="card">
        <div class="left">
          <div class="img">
            <img src="./assets/user.jpg" alt="user" width="50"/>
          </div>
          <div class="detail">
            <div class="name"><p>Devanka</p></div>
            <div class="last">Aowkwk</div>
          </div>
        </div>
        <div class="right">
          <div class="last">11/12/24</div>
          <div class="unread">7</div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### PM - CONTENT
```html
<div class="content">
  <div class="top">
    <div class="left">
      <div class="btn back"><i class="fa-solid fa-arrow-left"></i></div>
      <div class="user">
        <div class="img">
          <img src="./assets/user.jpg" alt="user" width="30" />
        </div>
        <div class="name"><p>Devanka</p></div>
      </div>
    </div>
    <div class="right">
      <div class="btn">
        <i class="fa-solid fa-video"></i>
      </div>
      <div class="btn">
        <i class="fa-solid fa-phone"></i>
      </div>
      <div class="btn">
        <i class="fa-solid fa-ellipsis-vertical"></i>
      </div>
    </div>
  </div>
  <div class="mid">
    <div class="chats">
      <div class="card">
        <div class="chp sender">
          <div class="name">Devanka</div>
          <div class="actions">
            <div class="btn"><i class="fa-solid fa-ellipsis"></i></div>
          </div>
        </div>
        <div class="chp embed">
          <div class="name">Bukan Devanka</div>
          <div class="msg">
            <p><i class="fa-solid fa-image"></i> Ini pesan yang dibalas</p>
          </div>
        </div>
        <div class="chp attach">
          <div class="img">
            <img src="./assets/fivem_wp.jpg" alt="image"/>
          </div>
          <div class="document">
            <p>ini_file_apa_ya.txt</p>
          </div>
        </div>
        <div class="chp text">
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Facilis facere amet eius dicta! Quibusdam tenetur minus saepe cum, officia reiciendis nam soluta fugit ab laboriosam, reprehenderit quidem. Explicabo, voluptates ducimus!</p>
        </div>
        <div class="chp time">
          <p>11:12 11/12/2024</p>
        </div>
      </div>
      <div class="card me short">
        <div class="chp sender">
          <div class="name">Devanka</div>
          <div class="actions">
            <div class="btn"><i class="fa-solid fa-ellipsis"></i></div>
          </div>
        </div>
        <div class="chp text">
          <p>lorem ipsum</p>
        </div>
        <div class="chp time">
          <p>11:12 11/12/2024</p>
        </div>
      </div>
      <div class="card short">
        <div class="chp sender">
          <div class="name">Devanka</div>
          <div class="actions">
            <div class="btn"><i class="fa-solid fa-ellipsis"></i></div>
          </div>
        </div>
        <div class="chp attach">
          <div class="voice">
            <div class="control">
              <div class="btn"><i class="fa-solid fa-play"></i></div>
            </div>
            <div class="range">
              <input type="range" name="chat_range_id" id="chat_range_id">
            </div>
            <div class="duration">
              <p>00:00</p>
            </div>
          </div>
        </div>
        <div class="chp time">
          <p>11:12 11/12/2024</p>
        </div>
      </div>
    </div>
  </div>
  <div class="bottom">
    <div class="embed">
      <div class="box">
        <div class="left">
          <p>Devanka</p>
          <p>Lorem ipsum dol ...</p>
        </div>
        <div class="right">
          <div class="btn"><i class="fa-duotone fa-circle-x"></i></div>
        </div>
      </div>
    </div>
    <div class="field">
      <div class="input">
        <div class="emoji">
          <div class="btn btn-emoji">
            <i class="fa-solid fa-face-smile"></i>
          </div>
        </div>
        <div class="textbox">
          <textarea name="content-input" id="content-input" placeholder="Type Here"></textarea>
        </div>
        <div class="actions">
          <div class="btn btn-attach">
            <i class="fa-solid fa-paperclip"></i>
          </div>
          <div class="btn btn-image">
            <i class="fa-solid fa-camera-retro"></i>
          </div>
        </div>
      </div>
      <div class="voice">
        <div class="btn btn-voice">
          <i class="fa-solid fa-microphone"></i>
        </div>
      </div>
    </div>
  </div>
</div>
```