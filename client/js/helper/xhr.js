export default {
  async requesta(method, url, s) {
    let data = {method};
    if(method == 'POST') {
      data.headers = {'Content-Type': 'application/json'};
      data.body = JSON.stringify(s);
    }
    return await fetch(url, data).then(res => {
      if(!res.ok) return {code:500,msg:'ERROR', data:`${res.status} ${res.statusText} ${res.url}`};
      return res.json();
    }).then(res => res).catch(err => {
      return {code:500,msg:'ERROR',data:err};
    });
  },
  request(method, url, s = {}, el = null) {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.responseType = "json";

      if(el) xhr.upload.onprogress = ({loaded,total}) => {
        const elpr = document.querySelector(el);
        const progress = Math.floor((loaded / total) * 100);
        let spanpr = elpr.querySelector('span');
        if(!spanpr) {
          spanpr = document.createElement('span');
          elpr.append(spanpr);
        }
        spanpr.innerHTML = ' ' + progress + '%';
      };

      xhr.onload = () => {
        if(xhr.status >= 400) {
          resolve({code:xhr.status,msg:'ERROR',data:xhr.response});
        } else {
          resolve(xhr.response);
        }
      }
       xhr.onerror = (err) => resolve({code:500,msg:'ERROR',data:err});

       if(method === 'POST') {
         xhr.setRequestHeader('Content-Type', 'application/json');
         xhr.send(JSON.stringify(s));
       } else {
        xhr.send();
       }
    });
  },
  async get(ref) {
    return await this.request('GET', ref);
  },
  async post(ref, s = {}, el = null) {
    return await this.request('POST', ref, s, el);
  }
}