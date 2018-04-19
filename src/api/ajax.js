import axios from 'axios';

let baseurl = 'http://localhost:3000';

export const ajax = (method, url, param) =>
  axios({
    method: method,
    url: baseurl + url,
    data: param,
    responsetype: 'json'
  });
