import { ajax } from './ajax';

export const fetchItem = id => ajax('get', '/api', { aaa: 123 });

export const test = () => ajax('post', '/api', { aaa: 123 });
