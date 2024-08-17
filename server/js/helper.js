module.exports = {
  peerKey() {
    return require('crypto').randomBytes(16).toString('hex');
  }
}