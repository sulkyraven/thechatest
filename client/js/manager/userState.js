class userState {
  constructor() {
    this.lang = 'en';
    this.langs = ['id','en'];
    this.pmtop = null;
    this.pmmid = null;
    this.pmbottom = null;
    this.locked = { bottom: false, mid: false }
  }
  save() {
    window.localStorage.setItem('kirimin_cache_01', JSON.stringify({
      lang: this.lang
    }));
  }
  getFile() {
    if(!window.localStorage) return null;

    const file = window.localStorage.getItem('kirimin_cache_01');
    return file ? JSON.parse(file) : null;
  }
  load() {
    const file = this.getFile();
    if(file) Object.keys(file).forEach(key => this[key] = file[key]);
  }
}

export default new userState();