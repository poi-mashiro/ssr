package.json

"babel-core": "^6.26.0",
"babel-eslint": "^8.2.2",
"babel-helper-vue-jsx-merge-props": "^2.0.3",
"babel-loader": "^7.1.4",
"babel-plugin-dynamic-import-node": "^1.2.0",
"babel-plugin-syntax-dynamic-import": "^6.18.0",
"babel-plugin-syntax-jsx": "^6.18.0",
"babel-plugin-transform-runtime": "^6.23.0",
"babel-plugin-transform-vue-jsx": "^3.7.0",
"babel-preset-env": "^1.6.1",
"babel-preset-stage-2": "^6.24.1",
"babel-register": "^6.26.0",


.babelrc

{
  "presets": [
    "es2015",

    [
      "env",
      {
        "modules": false,
        "targets": {
          "browsers": ["> 1%", "last 2 versions", "not ie <= 8"]
        }
      }
    ],
    "stage-2"
  ],
  "plugins": [
    ["transform-runtime", { "polyfill": true }],
    "dynamic-import-node",
    "syntax-dynamic-import"
  ],
  "env": {
    "test": {
      "presets": ["env", "stage-2"]
    }
  }
}

过渡入口
index.js

require('babel-register');
require('./app.js');

app.js

import Koa from 'koa';

const app = new Koa();

app.use(async ctx => {
  ctx.body = 'hello world';
});

app.listen(3000);

启动
node 入口.js