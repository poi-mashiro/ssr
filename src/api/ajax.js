import axios from 'axios';

let baseurl = 'localhost:3000';

export const ajax = (method, url, param) => {
  axios({
    method: 'method',
    url: baseurl + url,
    data: param
  }).then(res => {
    console.log(res)
    return res.data
  });
}
