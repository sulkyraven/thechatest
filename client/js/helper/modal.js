export default {
  async waittime(ms = 450) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  async loading(newfunc, msg = 'LOADING') {
    const el = document.createElement('div');
    el.classList.add('loading');
    el.innerHTML = `
    <div class="box">
      <div class="spinner">
        <i class="fa-solid fa-spinner"></i>
      </div>
      <p>${msg}</p>
    </div>`;
    document.querySelector('.app').append(el);

    await this.waittime();

    return await newfunc.then(async res => {
      el.classList.add('out');
      await this.waittime();
      el.remove();
      return res;
    }).catch(async err => {
      el.classList.add('out');
      await this.waittime();
      el.remove();
      return err;
    });
  },
  element() {
    const el = document.createElement('div');
    el.classList.add('modal');
    return el;
  },
  alert(s) {
    return new Promise(resolve => {
      const el = this.element();
      el.innerHTML = `
      <div class="box">
        <div class="icons">
          <i class="fa-duotone fa-${s.icon?s.icon:'circle-exclamation'}"></i>
        </div>
        <div class="messages"><p></p></div>
        <div class="action">
          <div class="btn btn-ok" role="button">OK</div>
        </div>
      </div>`;
      
      const p = el.querySelector('.box .messages p');
      p.innerText = typeof(s) === 'string' ? s : (s.msg || '');

      const btn = el.querySelector('.action .btn-ok');
      if(s.okx) btn.innerText = s.okx;

      document.querySelector('.app').append(el);
      
      btn.onclick = async() => {
        el.classList.add('out');
        await this.waittime();
        el.remove();
        resolve(true);
        if(s.ok) s.ok();
      }
    });
  },
  confirm(s) {
    return new Promise(resolve => {
      const el = this.element();
      el.innerHTML = `
      <div class="box">
        <div class="icons">
          <i class="fa-duotone fa-${s.icon?s.icon:'circle-exclamation'}"></i>
        </div>
        <div class="messages"><p></p></div>
        <div class="actions">
          <div class="btn btn-cancel" role="button">BATAL</div>
          <div class="btn btn-ok" role="button">OK</div>
        </div>
      </div>`;
      
      const p = el.querySelector('.box .messages p');
      p.innerText = typeof(s) === 'string' ? s : (s.msg || '');
      
      const btnOk = el.querySelector('.actions .btn-ok');
      if(s.okx) btnOk.innerText = s.okx;
      const btnCancel = el.querySelector('.actions .btn-cancel');
      if(s.cancelx) btnCancel.innerText = s.cancelx;

      document.querySelector('.app').append(el);

      btnOk.onclick = async() => {
        el.classList.add('out');
        await this.waittime();
        el.remove();
        resolve(true);
        if(s.ok) s.ok();
      }
      btnCancel.onclick = async() => {
        el.classList.add('out');
        await this.waittime();
        el.remove();
        resolve(false);
        if(s.cancel) s.cancel();
      }
    });
  },
  prompt(s) {
    return new Promise(resolve => {
      const el = this.element();
      el.innerHTML = `
      <div class="box">
        <div class="icons">
          <i class="fa-duotone fa-${s.icon?s.icon:'circle-exclamation'}"></i>
        </div>
        <div class="messages">
          <p><label for="prompt-field"></label></p>
          <input type="text" name="prompt-field" id="prompt-field" autocomplete="off" maxlength="${s.max ? s.max : '100'}" placeholder="Type Here"/>
        </div>
        <div class="actions">
          <div class="btn btn-cancel" role="button">BATAL</div>
          <div class="btn btn-ok" role="button">OK</div>
        </div>
      </div>`;
      
      const p = el.querySelector('.box .messages p');
      p.innerText = typeof(s) === 'string' ? s : (s.msg || '');
      
      const btnOk = el.querySelector('.actions .btn-ok');
      if(s.okx) btnOk.innerText = s.okx;
      const btnCancel = el.querySelector('.actions .btn-cancel');
      if(s.cancelx) btnCancel.innerText = s.cancelx;

      const input = el.querySelector('.box .messages #prompt-field');

      document.querySelector('.app').append(el);

      input.focus();

      btnOk.onclick = async() => {
        el.classList.add('out');
        await this.waittime();
        el.remove();
        resolve({val:input.value});
        if(s.ok) s.ok();
      }
      btnCancel.onclick = async() => {
        el.classList.add('out');
        await this.waittime();
        el.remove();
        resolve(null);
        if(s.cancel) s.cancel();
      }
    });
  }
}