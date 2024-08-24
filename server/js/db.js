const fs = require('fs');

const dirpath = './server/db';
class DevankaDatabase {
  constructor() {
    this.ref = {u:{},t:{},c:{},f:{},p:{}};
  }
  load() {
    Object.keys(this.ref).forEach(file => {
      if(!fs.existsSync(dirpath)) fs.mkdirSync(dirpath);
      if(!fs.existsSync(`${dirpath}/${file}.json`)) fs.writeFileSync(`${dirpath}/${file}.json`, JSON.stringify(this.ref[file]), 'utf-8');

      let filebuffer = fs.readFileSync(`${dirpath}/${file}.json`, 'utf-8');
      this.ref[file] = JSON.parse(filebuffer);
      if(file == 'u') {
        Object.keys(this.ref[file]).forEach(k => {
          if(this.ref[file][k].peer) delete this.ref[file][k].peer;
        });
      }
      console.log(`[${file}] data loaded!`);
    });
  }
  save(s) {
    if(typeof s === 'string') s = [s];
    s.forEach(file => fs.writeFileSync(`${dirpath}/${file}.json`, JSON.stringify(this.ref[file]), 'utf-8'));
  }
}
module.exports = new DevankaDatabase();