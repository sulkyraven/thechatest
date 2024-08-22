module.exports = {
  peerKey() {
    return require('crypto').randomBytes(16).toString('hex');
  },
  rNumber(n = 6) {
     let a = "";
     for(let i = 1; i < n; i++) { a += "0"; }
     return Math.floor(Math.random() * Number("9" + a)) + Number("1" + a);
  }
}