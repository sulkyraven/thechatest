export default {
  async request(method, url, s) {
    let data = {method};
    if(method == 'POST') {
      data.headers = {'Content-Type': 'application/json'};
      data.body = JSON.stringify(s);
    }
    return await fetch(url, data).then(res => {
      if(!res.ok) return {code:500,msg:'Something went wrong', data:`${res.status} ${res.statusText} ${res.url}`};
      return res.json();
    }).then(res => res).catch(err => {
      return {code:500,msg:'Something went wrong',data:err};
    });
  },
  async get(ref) {
    return await this.request('GET', ref);
  },
  async post(ref, s = {}) {
    return await this.request('POST', ref, s);
  }
}