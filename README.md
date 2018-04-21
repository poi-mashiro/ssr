# vue ssr 流程

## [前言](#0)

1.  [环境配置](#1)
2.  [基础实现](#2)
3.  [开发配置](#3)
4.  [其他 和 注意点](#4)
5.  [附配置](#5)

<span id = "0"></span>

#### 前言

首先，明白自己是否真的需要 ssr ，需要自己从头搭环境，请阅读 [官方教程](https://ssr.vuejs.org/zh/)  
根据实际情况，可以使用以下方式，不使用构建环境
```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>xxxxxx</title>
  <script src="vue.js"></script>
</head>

<body>
  <!--页面内容 省略，写完静态页面之后，交给后端使用 例如 我之前的 php 他使用 smarty 模板 插入数据 -->
  <script src="xxx.js"></script>
</body>

</html>
```
其次，如果必须要 ssr ，建议使用 [nuxt.js](https://zh.nuxtjs.org/)，如果想要自己控制整个流程，那么 nuxt.js 就不合适了  
再次，可以在 官方 的 [demo](https://github.com/vuejs/vue-hackernews-2.0/) 的基础上进行修改来开发页面部分，虽然不知道为什么我 npm run build npm start 之后，出不来页面，可能是获取数据的问题导致的

<span id = "1"></span>

#### 1 环境配置

在能使用 async/await import/export 的情况下，不使用，和咸鱼有什么区别，因此 package.json

```
  "scripts": {
    "start": "cross-env NODE_ENV=production node server/index.js",
    "prod": "npm run build && npm run start",
    "dev": "nodemon server/index.js",  // 使用 nodemon 自动重启服务器, 注意热更新不支持 nodemon
    "build": "rimraf dist && npm run build:client && npm run build:server",  // 移除 dist 目录，再编译
    "build:client": "cross-env NODE_ENV=production webpack --config build/webpack.client.conf.js --colors --progress",
    "build:server": "cross-env NODE_ENV=production webpack --config build/webpack.server.conf.js --colors --progress",
    "analyz": "cross-env analyz_config_report=true npm run build:client"
  },
  "dependencies": {
    "axios": "^0.18.0",
    "koa": "^2.5.0",
    "koa-bodyparser": "^4.2.0",
    "koa-compress": "^2.0.0",
    "koa-router": "^7.4.0",
    "koa-static": "^4.0.2",
    "lru-cache": "^4.1.2",
    "vue": "^2.5.16",
    "vue-router": "^3.0.1",
    "vue-server-renderer": "^2.5.16",
    "vuex": "^3.0.1",
    "vuex-router-sync": "^5.0.0"
  },
  "devDependencies": {
    "autoprefixer": "^8.3.0",
    "babel-core": "^6.26.0",
    "babel-eslint": "^8.2.3",
    "babel-helper-vue-jsx-merge-props": "^2.0.3",
    "babel-loader": "^7.1.4",
    "babel-plugin-dynamic-import-node": "^1.2.0",
    "babel-plugin-syntax-dynamic-import": "^6.18.0",
    "babel-plugin-syntax-jsx": "^6.18.0",
    "babel-plugin-transform-runtime": "^6.23.0",
    "babel-plugin-transform-vue-jsx": "^3.7.0",
    "babel-preset-env": "^1.6.1",
    "babel-register": "^6.26.0",
    "cross-env": "^5.1.4",
    "css-loader": "^0.28.11",
    "eslint": "^4.19.1",
    "eslint-config-standard": "^11.0.0",
    "eslint-friendly-formatter": "^4.0.1",
    "eslint-loader": "^2.0.0",
    "eslint-plugin-import": "^2.11.0",
    "eslint-plugin-node": "^6.0.1",
    "eslint-plugin-promise": "^3.7.0",
    "eslint-plugin-standard": "^3.0.1",
    "eslint-plugin-vue": "^4.4.0",
    "extract-text-webpack-plugin": "^4.0.0-beta.0",
    "file-loader": "^1.1.11",
    "friendly-errors-webpack-plugin": "^1.7.0",
    "html-webpack-plugin": "^3.2.0",
    "mini-css-extract-plugin": "^0.4.0",
    "node-notifier": "^5.2.1",
    "nodemon": "^1.17.3",
    "optimize-css-assets-webpack-plugin": "^4.0.0",
    "rimraf": "^2.6.2",
    "stylus": "^0.54.5",
    "stylus-loader": "^3.0.2",
    "url-loader": "^1.0.1",
    "vue-loader": "^14.2.2",
    "vue-style-loader": "^4.1.0",
    "vue-template-compiler": "^2.5.16",
    "webpack": "^4.6.0",
    "webpack-bundle-analyzer": "^2.11.1",
    "webpack-cli": "^2.0.14",
    "webpack-dev-middleware": "^3.1.2",
    "webpack-hot-middleware": "^2.22.1",
    "webpack-merge": "^4.1.2",
    "webpack-node-externals": "^1.7.2"
  }
```

让 node 支持使用 import/export ，配置 .babelrc

```
{
  "presets": [
    "es2015",  // 缺省此项，会导致不转译 import
    [
      "env",
      {
        "modules": false,
        "targets": {
          "browsers": ["> 1%", "last 2 versions", "not ie <= 10"]
        }
      }
    ]
  ],
  "comments": false,
  "plugins": [
    "transform-vue-jsx",   // 如果使用到jsx 的话
    "transform-runtime",
    "dynamic-import-node",  // node 中转译 import 的插件
    "syntax-dynamic-import" // 转译 import 的插件
  ],
  "env": {
    "test": {
      "presets": ["env"]
    }
  }
}
```

eslint 配置省略，个人喜欢就行  
目录结构

```
  build            webpack 配置，及开发服务器（注： 个人未配置编译 服务端代码的webpack
    dev.js                 配置 webpack-dev-middleware
    hot.js                 配置 webpack-hot-middleware
    setup-dev-server.js
    style-loader.js
    vue-loader.conf.js
    webpack.base.conf.js
    webpack.client.conf.js
    webpack.dev.conf.js
    webpack.prod.conf.js
    webpack.server.conf.js
  config/xxxx           一些 webpack 简单配置
  server                服务端代码
    router
      index.js          服务端路由处理
    app.js              服务端功能入口，正式环境请使用 webpack 以此文件为入口编译服务端
    index.js            开发，调试使用入口
    ssr.js              实现 ssr 功能的单独文件
  src                   前端代码
    api
      ajax.js           封装axios
      api.js            api 调用列表
    router
      index.js          页面路由
    store
      index.js          预取数据及状态管理
    components          摸索时的简单组件
      A.vue
      B.vue
      C.vue
    app.js              相遇当 vue init webpack 后的 main.js
    App.vue             入口组件
    entry-client.js     前端编译入口
    entry-server.js     ssr 编译入口
```

<span id = "2"></span>

#### 2 基础实现

省略一些步骤，详细的可以看 [官方教程](https://ssr.vuejs.org/zh/)  
和 SPA 的区别就在于 vue init webpack 后的 main.js 最后 new Vue() 变成 export 函数来重复进行 new Vue() 来保证 用户访问的数据不会弄混  
ajax.js
```
import axios from 'axios';

let baseurl = 'http://localhost:3000';

export const ajax = (method, url, param) =>
  axios({
    method: method,
    url: baseurl + url,
    data: param,
    responsetype: 'json'
  });
```

api.js

```
import { ajax } from './ajax';

export const fetchItem = id => ajax('get', '/api', { aaa: 123 });  // 测试 store 预取数据

export const test = () => ajax('post', '/api', { aaa: 123 });  // 测试 页面混合后 的数据请求
```
A.vue                     ssr 时请慎用 table 等标签，请参考[官方教程](https://ssr.vuejs.org/zh/hydration.html)
```
<template>
 <div>{{ item }}</div>
</template>

<script>
export default {
 name: 'A',
 asyncData({ store, route }) {   // ssr 特有 只在服务端运行
   // 触发 action 后，会返回 Promise
   return store.dispatch('fetchItem', route.params.id);
 },
 computed: {
   // 从 store 的 state 对象中的获取 item。
   item() {
     return this.$store.state.items[this.$route.params.id];
   }
 }
};
</script>
```
B.vue
```
<template>
 <div>
   <p @click="testapi">点击post请求</p>
   <p>{{ aaa }}</p>
 </div>
</template>

<script>
import {test} from '../api/api';

export default {
 name: 'B',
 data() {
   return {
     aaa: ''
   };
 },
 methods: {
   testapi() {
     test().then(res => {
       console.log(res);
       this.aaa = res.data;
     });
   }
 }
};
</script>
```
C.vue
```
<template>
 <div>ccccc</div>
</template>

<script>
export default {
 name: 'C'
};
</script>
```
App.vue
```
<template>
  <div id="app">
    <p>app.vue</p>
    <router-link tag="span" :to="{ path: '/a' }">a</router-link>
    <router-link tag="span" :to="{ path: '/b' }">b</router-link>
    <router-link tag="span" :to="{ path: '/c' }">c</router-link>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
};
</script>
```
router/index.js     ssr 异步组件 需要 vue 2.5+
```
import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export function createRouter() {
  return new Router({
    mode: 'history',
    routes: [
      { path: '/', component: () => import('../components/A.vue') },
      { path: '/a', component: () => import('../components/A.vue') },
      { path: '/b', component: () => import('../components/B.vue') },
      { path: '/c', component: () => import('../components/C.vue') }
    ]
  });
}
```
store/index.js      代码拆分，请参考[官方教程](https://ssr.vuejs.org/zh/data.html)
```
import Vue from 'vue';
import Vuex from 'vuex';
// 假定我们有一个可以返回 Promise 的
// 通用 API（请忽略此 API 具体实现细节）
import { fetchItem } from '../api/api';

Vue.use(Vuex);

export function createStore() {
  return new Vuex.Store({
    state: {
      items: {}
    },
    actions: {
      fetchItem({ commit }, id) {
        // `store.dispatch()` 会返回 Promise，
        // 以便我们能够知道数据在何时更新
        return fetchItem(id).then(item => {
          console.log(item.data);
          console.log('');
          console.log('');
          console.log('');
          commit('setItem', { id, item: item.data });
        });
      }
    },
    mutations: {
      setItem(state, { id, item }) {
        Vue.set(state.items, id, item);
      }
    }
  });
}
```
app.js
```
import Vue from 'vue';
import App from './App.vue';
import { createRouter } from './router';
import { createStore } from './store';
import { sync } from 'vuex-router-sync';

export function createApp () {
  // 创建 router 实例
  const router = createRouter();
  const store = createStore();
  // 同步路由状态(route state)到 store
  sync(store, router);
  const app = new Vue({
    // 注入 router 到根 Vue 实例
    router,
    store,
    render: h => h(App)
  });
  // 返回 app 和 router
  return { app, router, store };
}
```
entry-client.js 接管 ssr 的html, 客户端数据预取  请参考[官方教程](https://ssr.vuejs.org/zh/data.html)
```
import Vue from 'vue';
import { createApp } from './app';
const { app, router, store } = createApp();
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__);
}

// 组件重用 调用 asyncData 函数
Vue.mixin({
  beforeRouteUpdate (to, from, next) {
    const { asyncData } = this.$options
    if (asyncData) {
      asyncData({
        store: this.$store,
        route: to
      }).then(next).catch(next)
    } else {
      next()
    }
  }
})

router.onReady(() => {
  // 添加路由钩子函数，用于处理 asyncData.
  // 在初始路由 resolve 后执行，
  // 以便我们不会二次预取(double-fetch)已有的数据。
  // 使用 `router.beforeResolve()`，以便确保所有异步组件都 resolve。
  router.beforeResolve((to, from, next) => {
    const matched = router.getMatchedComponents(to)
    const prevMatched = router.getMatchedComponents(from)
    // 我们只关心之前没有渲染的组件
    // 所以我们对比它们，找出两个匹配列表的差异组件
    let diffed = false
    const activated = matched.filter((c, i) => {
      return diffed || (diffed = (prevMatched[i] !== c))
    })
    if (!activated.length) {
      return next()
    }
    // 这里如果有加载指示器(loading indicator)，就触发
    Promise.all(activated.map(c => {
      if (c.asyncData) {
        return c.asyncData({ store, route: to })
      }
    })).then(() => {
      // 停止加载指示器(loading indicator)
      next()
    }).catch(next)
  })
  app.$mount('#app')
})
```
entry-server.js 生成html 结构
```
import { createApp } from './app';

const isDev = process.env.NODE_ENV !== 'production';

export default context => {
  return new Promise((resolve, reject) => {
    const s = isDev && Date.now();
    const { app, router, store } = createApp();

    const { url } = context;
    const { fullPath } = router.resolve(url).route;

    if (fullPath !== url) {
      return reject({ url: fullPath });
    }
    router.push(url);
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents();
      if (!matchedComponents.length) {
        return reject({ code: 404 });
      }
      // 对所有匹配的路由组件调用 `asyncData()`
      Promise.all(
        matchedComponents.map(Component => {
          if (Component.asyncData) {
            return Component.asyncData({
              store,
              route: router.currentRoute
            });
          }
        })
      )
        .then(() => {
          isDev && console.log(`data pre-fetch: ${Date.now() - s}ms`);
          // 在所有预取钩子(preFetch hook) resolve 后，
          // 我们的 store 现在已经填充入渲染应用程序所需的状态。
          // 当我们将状态附加到上下文，
          // 并且 `template` 选项用于 renderer 时，
          // 状态将自动序列化为 `window.__INITIAL_STATE__`，并注入 HTML。
          context.state = store.state;
          resolve(app);
        })
        .catch(reject);
    }, reject);
  });
};
```
index.html  静态内容 vue-ssr-outlet 是 ssr 内容的注入位置 head 内容管理,请参考[官方教程](https://ssr.vuejs.org/zh/head.html)
```
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>xxxx</title>
</head>

<body>
  <!--vue-ssr-outlet-->
</body>

</html>
```
##### 查看效果
简单配置webpack.server.conf.js
```
const path = require('path');
const vueLoaderConfig = require('./vue-loader.conf');  // vueLoaderConfig 可以使用 vue init template 中的 vue-loader.conf.js 和 utils.js 中提取出功能, webpack 4 要安装 extract-text-webpack-plugin@next

const ExtractTextPlugin = require('extract-text-webpack-plugin');  // 取决于 vueLoaderConfig 相关功能中使用哪个抽离css
const MiniCssExtractPlugin = require('mini-css-extract-plugin');  //  取决于 vueLoaderConfig 相关功能中使用哪个抽离css

function resolve (dir) {
  return path.join(__dirname, '..', dir);

module.exports = {
  context: path.resolve(__dirname, '../'),
  mode: 'production',
  entry: {
    serverapp: './src/entry-server.js'
  },
  target: 'node',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '@': resolve('src')
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [
          resolve('src'),
          resolve('test'),
          resolve('node_modules/webpack-dev-server/client')
        ]
      }
    ]
  },
  plugins: [
    // 抽离css
    // new ExtractTextPlugin({
    //   filename: assetsPath('css/[name].[hash:7].css')
    // })
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output// both options are optional
      filename: 'css/[name].[hash].css',
      chunkFilename: 'css/[id].[chunkhash].css'
    })
  ]
};
```
使用 npm run build:server 得到 serverapp.js  
编写 server/app.js
```
import Koa from 'koa';
import fs from 'fs';
import path from 'path';
import bodyParser from 'koa-bodyparser';
import KoaRouter from 'koa-router';

import { createRenderer, createBundleRenderer } from 'vue-server-renderer';
import createApp from '../dist/serverapp';

const template = fs.readFileSync('src/index.html', 'utf-8');
const renderer = createRenderer();
// console.log(renderer)

const app = new Koa();

// 使用post处理中间件
app.use(bodyParser());


// 实现一个简单 api 路由
const router = new KoaRouter();

router
  .get('/api', async (ctx, next) => {
    console.log(ctx);
    console.log('');
    console.log('');
    console.log('');
    console.log('');
    ctx.body = JSON.stringify({ id: '123', text: 'aaaa' });
  })
  .post('/api', async (ctx, next) => {
    ctx.body = ctx.request.body;
  });

app.use(router.routes()).use(router.allowedMethods());

app.use(async ctx => {
  console.log(ctx.url);
  if (ctx.req.url === '/favicon.ico') {
    return;
  }
  const context = { url: ctx.req.url };
  await createApp(context).then(app => {
    renderer.renderToString(app, (err, html) => {
      console.log(err, html);
      if (err) {
        if (err.code === 404) {
          ctx.status = 404;
          ctx.body = 'Page not found';
        } else {
          ctx.status = 500;
          ctx.body = 'Internal Server Error';
        }
      } else {
        ctx.body = html;
      }
    });
  });
});

app.listen(3000, () => {
  console.log('starting at port 3000');
});
```
server/index.js 为了使用 import 作为过渡入口
```
require('babel-register');
require('./app.js');
```
bash 中 node server/index.js 访问 localhost:3000 查看效果，这时的页面只有 静态html, 由于尚未编译客户端入口

##### vue 接管页面
参考[官方教程：bundle render](https://ssr.vuejs.org/zh/bundle-renderer.html)  [官方教程：构建配置](https://ssr.vuejs.org/zh/build-config.html)  
修改 webpack 的配置
使用 createBundleRenderer 渲染页面  
修改server/app.js
```
import Koa from 'koa';
import fs from 'fs';
import path from 'path';
import bodyParser from 'koa-bodyparser';
import staticFlies from 'koa-static';
import KoaRouter from 'koa-router';

import { createRenderer, createBundleRenderer } from 'vue-server-renderer';
import serverBundle from '../dist/vue-ssr-server-bundle.json';
import clientManifest from '../dist/vue-ssr-client-manifest.json';

const template = fs.readFileSync('src/index.html', 'utf-8');
// const renderer = createRenderer();
const renderer = createBundleRenderer(serverBundle, {
  template,
  clientManifest
});
// console.log(renderer)

const app = new Koa();

// 使用post处理中间件
app.use(bodyParser());
// 设置静态资源路径
app.use(staticFlies(path.resolve(__dirname, '../')));

// 实现一个简单 api 路由
const router = new KoaRouter();

router
  .get('/api', async (ctx, next) => {
    console.log(ctx);
    console.log('');
    console.log('');
    console.log('');
    console.log('');
    ctx.body = JSON.stringify({ id: '123', text: 'aaaa' });
  })
  .post('/api', async (ctx, next) => {
    ctx.body = ctx.request.body;
  });

app.use(router.routes()).use(router.allowedMethods());

app.use(async ctx => {
  console.log(ctx.url);
  if (ctx.req.url === '/favicon.ico') {
    return;
  }
  const renderData = (ctx, renderer) => {
    const context = {
      url: ctx.url
    };

    return new Promise((resolve, reject) => {
      renderer.renderToString(context, (err, html) => {
        if (err) {
          return reject(err);
        }
        resolve(html);
      });
    });
  };
  ctx.body = await renderData(ctx, renderer)
});

app.listen(3000, () => {
  console.log('starting at port 3000');
});
```
使用npm run build 编译
如果你愿意每次修改都 中断服务器，并且 npm run build 再重启服务器的话，到这就已经足够了

<span id = "3"></span>

#### 3 开发配置
配置 webpack 以及 实现 dev server  可以参考官方 demo
build/dev.js
```
const devMiddleware = require('webpack-dev-middleware');
module.exports = (compiler, opts) => {
  const middleware = devMiddleware(compiler, opts);
  let nextFlag = false;
  const nextFn = () => {
    nextFlag = true;
  };
  let Dev = (ctx, next) => {
    middleware(
      ctx.req,
      {
        send: content => (ctx.body = content),
        setHeader: (name, value) => ctx.set(name, value)
      },
      nextFn
    );
    if (nextFlag) {
      nextFlag = false;
      return next();
    }
  };
  Dev.fileSystem = middleware.fileSystem;
  return Dev;
};
```
build/hot.js
```
const hotMiddleware = require('webpack-hot-middleware');
const PassThrough = require('stream').PassThrough;

module.exports = (compiler, opts) => {
  const middleware = hotMiddleware(compiler, opts);
  return async (ctx, next) => {
    let stream = new PassThrough();
    ctx.body = stream;
    await middleware(
      ctx.req,
      {
        write: stream.write.bind(stream),
        writeHead: (status, headers) => {
          ctx.status = status;
          ctx.set(headers);
        }
      },
      next
    );
  };
};
```
setup-dev-server.js  参考了官方 demo
```
const fs = require('fs');
const path = require('path');
const MFS = require('memory-fs');
const webpack = require('webpack');
const clientConfig = require('./webpack.client.conf');
const serverConfig = require('./webpack.server.conf');
const webpackDevMiddleware = require('./koa/dev');
const webpackHotMiddleware = require('./koa/hot');

const readFile = (fs, file) =>
  fs.readFileSync(path.join(clientConfig.output.path, file), 'utf-8');

module.exports = function setupDevServer(app, cb) {
  let bundle;
  // let ready;
  // let template;
  let clientManifest;

  // const readyPromise = new Promise(resolve => {
  //   ready = resolve;
  // });
  const update = () => {
    if (bundle && clientManifest) {
      cb(bundle, clientManifest);
    }
  };
  // template = fs.readFileSync('src/index.html', 'utf-8');
  // client
  clientConfig.output.filename = '[name].js'; // 热更新不能跟 [chunkhash] 同用
  const clientCompiler = webpack(clientConfig);
  const devMiddleware = webpackDevMiddleware(clientCompiler, {
    //  绑定中间件的公共路径,使用与webpack相同
    publicPath: clientConfig.output.publicPath,
    stats: {
      //  用于形成统计信息的选项
      colors: true,
      chunks: false
    },
    noInfo: true, // 显示无信息到控制台（仅警告和错误）
    serverSideRender: false //  关闭服务器端渲染模式。有关详细信息，请参阅服务器端渲染部分
  });
  app.use(devMiddleware);
  clientCompiler.plugin('done', stats => {
    stats = stats.toJson();
    stats.errors.forEach(err => console.error(err));
    stats.warnings.forEach(err => console.warn(err));
    if (stats.errors.length) return;

    console.log('client-dev...');
    // let filePath = path.join(clientConfig.output.path, 'index.html');
    // if (fs.existsSync(filePath)) {
    //   // 读取内存模板
    //   template = readFile(fs, 'index.html');
    // }
    clientManifest = JSON.parse(
      readFile(devMiddleware.fileSystem, 'vue-ssr-client-manifest.json')
    );
    update();
  });
  app.use(webpackHotMiddleware(clientCompiler));

  // server
  const serverCompiler = webpack(serverConfig);
  const mfs = new MFS();
  serverCompiler.outputFileSystem = mfs;
  serverCompiler.watch({}, (err, stats) => {
    if (err) {
      throw err;
    }
    stats = stats.toJson();
    if (stats.errors.length) return;

    console.log('server-dev...');
    bundle = JSON.parse(readFile(mfs, 'vue-ssr-server-bundle.json'));
    update();
  });
};
```
拆分 ssr 功能 独立出 server/ssr.js
```
import path from 'path';
import fs from 'fs';
import LRU from 'lru-cache';
import KoaRouter from 'koa-router';
import { createBundleRenderer } from 'vue-server-renderer';

const router = KoaRouter();
const isProduction = process.env.NODE_ENV === 'production';
const resolve = file => path.resolve(__dirname, file);

const template = fs.readFileSync(resolve('../src/index.html'), 'utf-8');
const createRenderer = (serverBundle, clientManifest) =>
  createBundleRenderer(serverBundle, {
    cache: LRU({
      max: 1000,
      maxAge: 1000 * 60 * 15
    }),
    runInNewContext: false, // 推荐
    template, // （可选）页面模板
    clientManifest // （可选）客户端构建 manifest
  });

const renderData = (ctx, renderer) => {
  console.log(ctx.url);
  const context = {
    url: ctx.url
  };

  return new Promise((resolve, reject) => {
    renderer.renderToString(context, (err, html) => {
      if (err) {
        console.log('error:' + err);
        return reject(err);
      }
      resolve(html);
    });
  });
};

export const ssr = async app => {
  let renderer;
  console.log(isProduction);
  if (isProduction) {
    const [serverBundle, clientManifest] = await Promise.all([   // 合并 多个 import 异步操作，解构赋值 
      import('../dist/vue-ssr-server-bundle.json'),
      import('../dist/vue-ssr-client-manifest.json')
    ]);
    renderer = createRenderer(serverBundle, clientManifest);
    console.log(renderer);
  } else {
    let setupDevServer = await import('../build/setup-dev-server.js');
    // console.log(setupDevServer);
    setupDevServer(app, (serverBundle, clientManifest) => {
      console.log('bundle callback..');
      renderer = createRenderer(serverBundle, clientManifest);
      console.log(11111, '\n\n\n' + renderer + '');
    });
  }

  router.get('*', async (ctx, next) => {
    // 提示webpack还在工作
    console.log(ctx.url, renderer, '222222222222222222222222');
    if (!renderer) {
      ctx.type = 'html';
      return (ctx.body = 'waiting for compilation... refresh in a moment.');
    }
    const s = Date.now();
    let html;
    let status;
    try {
      html = await renderData(ctx, renderer);
    } catch (error) {
      console.log(error)
      if (error.code === 404) {
        status = 404;
        html = `404 Not Found`;
      } else {
        status = 500;
        html = `500 Internal Server Error`;
        console.log(`error during render: ${ctx.url}`);
      }
    }

    ctx.type = 'html';
    ctx.status = status || ctx.status;
    ctx.body = html;
    if (!isProduction) {
      console.log(`request cost: ${Date.now() - s}ms`);
    }
  });
  app.use(router.routes()).use(router.allowedMethods());
};
```
修改 server/app.js
```
'use strict';
import Koa from 'koa';
import path from 'path';
import bodyParser from 'koa-bodyparser';
import staticFlies from 'koa-static';
import compress from 'koa-compress';
import KoaRouter from 'koa-router';
import { ssr } from './ssr';

const app = new Koa();

app.use(async (ctx, next) => {
  console.log(ctx.url);
  if (ctx.url === '/favicon.ico') return;
  await next();
});
// gzip压缩   热更新不支持 gzip
if (process.env.NODE_ENV === 'production') {
  app.use(compress());
}

// 使用post处理中间件
app.use(bodyParser());
// 设置静态资源路径
app.use(staticFlies(path.resolve(__dirname, '../')));


const router = new KoaRouter();

router
  .get('/api', async (ctx, next) => {
    console.log(ctx);
    console.log('');
    console.log('');
    console.log('');
    console.log('');
    ctx.body = JSON.stringify({ id: '123', text: 'aaaa' });
  })
  .post('/api', async (ctx, next) => {
    ctx.body = ctx.request.body;
  });

app.use(router.routes()).use(router.allowedMethods());

// ssr(app);
const init = async () => {
  await ssr(app).catch(err => {
    throw err;
  });
  app.listen(3000, () => {
    console.log('starting at port 3000');
  });
};
init();
```
npm run dev   使用 nodemon 自动重启服务器, 注意热更新不支持 nodemon
使用热更新开发时，请使用 node server/index.js
或 npm run build 然后 npm start

<span id = "4"></span>

#### 4 其他 和 注意点
个人感觉 最大的麻烦是 配置 dev server, 因为平常都是使用的 webpack-dev-server，然后改写 ssr 功能, 基础实现 官方文档比较全面，基本复制粘贴就能跑起来, 加上参考修改vue init webpack 里的 webpack 配置  
请确保静态资源路径没有 index.html 或 打包后的静态资源没有直接指向静态资源路径的'/'，否则服务器会返回 打包后的 index.html 而不走 ssr  

css 压缩 个人参照 webpack 4 的推荐 使用了 mini css extract plugin 替代 extract-text-webpack-plugin  
参考了 console.log 的结果， 修改了 build/style-loader.js 以及 webpack.base.conf.js , mini css 不能像 ETWP 那样从 vue-style-loader 接收代码，会报错，而 ETMP 是提取 vue-style-loader 处理过的css  
webpack.prod.conf.js 中使用 optimize-css-assets-webpack-plugin 压缩css  

服务端的其他功能开发，请参考 koa 文档及他人教程

<span id = "5"></span>

#### 5 附配置
style-loader.js
```
'use strict';
// const path = require('path');
// 一个抽离出css的webpack插件！
// const ExtractTextPlugin = require('extract-text-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

exports.cssLoader = function(options) {
  options = options || {};

  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap
    }
  };

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap
    }
  };

  // generate loader string to be used with extract text plugin
  function generateLoaders(loader, loaderOptions) {
    const loaders = options.usePostCSS
      ? [cssLoader, postcssLoader]
      : [cssLoader];

    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      });
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      // console.log(
      //   '\r\n\r\n',
      //   ExtractTextPlugin.extract({
      //     use: loaders,
      //     fallback: 'vue-style-loader'
      //   }),
      //   '\r\n\r\n',
      //   [MiniCssExtractPlugin.loader, 'vue-style-loader'].concat(loaders)
      // );
      // return ExtractTextPlugin.extract({
      //   use: loaders,
      //   fallback: 'vue-style-loader'
      // });
      // console.log([MiniCssExtractPlugin.loader].concat(loaders));
      return [MiniCssExtractPlugin.loader].concat(loaders);
    } else {
      return ['vue-style-loader'].concat(loaders);
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  };
};

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoader = function(options) {
  const output = [];
  const loaders = exports.cssLoader(options);

  for (const extension in loaders) {
    const loader = loaders[extension];
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    });
  }

  return output;
};

```
vue-loader.js
```
'use strict';
const styleLoader = require('./style-loader');
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  loaders: styleLoader.cssLoader({
    sourceMap: !isProd,
    extract: isProd
  }),
  transformToRequire: {
    video: ['src', 'poster'],
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  }
};

```
webpack.base.conf.js
```
const path = require('path');
// const webpack = require('webpack');
const baseConfig = require('../config').base;
const vueLoaderConfig = require('./vue-loader.conf.js');
// const ExtractTextPlugin = require('extract-text-webpack-plugin');
const isProd = process.env.NODE_ENV === 'production';
const resolve = dir => path.join(__dirname, '..', dir);
const assetsPath = dir => path.posix.join(baseConfig.assetsPath, dir);
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: isProd ? 'production' : 'development',
  context: path.resolve(__dirname, '../'),
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/dist/',
    filename: '[name]-[chunkhash].js'
  },
  // 配置模块如何被解析
  resolve: {
    // 自动解析文件扩展名(补全文件后缀)(从左->右)
    // import hello from './hello'  （!hello.js? -> !hello.vue? -> !hello.json）
    extensions: ['.js', '.vue', '.json'],

    // 配置别名映射
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      src: resolve('src'),
      components: resolve('src/components'),
      assets: resolve('src/assets'),
      views: resolve('src/views'),
      store: resolve('src/store')
    }
  },
  // 处理模块的规则(可在此处使用不同的loader来处理模块！)
  module: {
    rules: [
      {
        test: /\.js$/, // 资源路径
        loader: 'babel-loader', // 该路径执行的loader
        include: resolve('src') // 指定哪个文件loader
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        // include: resolve('src'),
        options: vueLoaderConfig
      },
      {
        test: /\.(png|jpe?g|gif|svg|ico)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  plugins: [
    // 抽离css
    // new ExtractTextPlugin({
    //   filename: assetsPath('css/[name].[hash:7].css')
    // })
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output// both options are optional
      filename: 'css/[name].[hash].css',
      chunkFilename: 'css/[id].[chunkhash].css'
    })
  ]
};

```
webpack.client.conf.js
```
// const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const isProd = process.env.NODE_ENV === 'production';
let config = isProd
  ? require('./webpack.prod.conf.js')
  : require('./webpack.dev.conf.js');

module.exports = merge(config, {
  mode: isProd ? 'production' : 'development',
  entry: {
    app: path.resolve(__dirname, '../src/entry-client.js')
  },
  plugins: [new VueSSRClientPlugin()]
});

```
webpack.dev.conf.js
```
'use strict';
const path = require('path');
const webpack = require('webpack');
const styleLoader = require('./style-loader');
const devConf = require('../config').dev; // 开发环境配置参数
const baseConf = require('./webpack.base.conf'); // webpack基本配置

// 一个webpack配置合并模块,可简单的理解为与Object.assign()功能类似！
const merge = require('webpack-merge');
// 一个创建html入口文件的webpack插件！
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 一个编译提示的webpack插件！
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
// 发送系统通知的一个node模块！
const notifier = require('node-notifier');

const dev = merge(baseConf, {
  mode: 'development',
  module: {
    rules: styleLoader.styleLoader({ extract: false, sourceMap: true })
  },

  // 生成sourceMaps(方便调试)
  devtool: devConf.devtoolType,

  plugins: [
    // 开启HMR(热替换功能,替换更新部分,不重载页面！)
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),

    // 显示模块相对路径
    new webpack.NamedModulesPlugin(),

    // 配置html入口信息
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, '../src/index.html'),
      inject: true
    }),

    // 编译提示插件
    new FriendlyErrorsPlugin({
      compilationSuccessInfo: {
        messages: [`Your application is running here: http:`]
      },
      onErrors: function (severity, errors) {
        if (severity !== 'error') {
          return;
        }
        const error = errors[0];
        const filename = error.file.split('!').pop();
        // console.log(filename)
        // 编译出错时,右下角弹出错误提示！
        notifier.notify({
          title: 'blog',
          message: severity + ': ' + error.name,
          subtitle: filename || ''
        });
      }
    })
  ]
});

module.exports = dev;

```
webpack.prod.conf.js
```
'use strict';
const path = require('path');
const webpack = require('webpack');
const styleLoader = require('./style-loader');
const prodConf = require('../config').build; // 生产环境配置参数
const baseConf = require('./webpack.base.conf'); // webpack基本配置

// 一个webpack配置合并模块,可简单的理解为与Object.assign()功能类似！
const merge = require('webpack-merge');
// 一个创建html入口文件的webpack插件！
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 一个拷贝文件的webpack插件！
// const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// 资源路径
const assetsPath = dir => path.posix.join(prodConf.assetsPath, dir);

const prod = merge({}, baseConf, {
  mode: 'production',
  output: {
    // 文件名
    filename: assetsPath('js/[name].[chunkhash].min.js'),

    // 用于打包require.ensure(代码分割)方法中引入的模块
    chunkFilename: assetsPath('js/[name].[chunkhash].js')
  },
  module: {
    rules: styleLoader.styleLoader({
      extract: true,
      sourceMap: false
    })
  },

  optimization: {
    runtimeChunk: {
      name: 'manifest'
    },
    minimizer: [new OptimizeCSSAssetsPlugin()], // [new UglifyJsPlugin({...})]
    splitChunks: {
      chunks: 'async', // 必须三选一： "initial" | "all"(默认就是all) | "async"
      minSize: 0, // 最小尺寸，默认0
      minChunks: 1, // 最小 chunk ，默认1
      // maxAsyncRequests: 1, // 最大异步请求数， 默认1
      // maxInitialRequests: 1, // 最大初始化请求书，默认1
      // name: () => {}, // 名称，此选项课接收 function
      name: false,
      cacheGroups: {
        vendor: {
          name: 'vendor',
          chunks: 'all',
          priority: -10,
          reuseExistingChunk: true,
          test: /node_modules\/(.*)\.js/
        },
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
    /*

        optimization: {
            splitChunks: {
              chunks: "initial",         // 必须三选一： "initial" | "all"(默认就是all) | "async"
              minSize: 0,                // 最小尺寸，默认0
              minChunks: 1,              // 最小 chunk ，默认1
              maxAsyncRequests: 1,       // 最大异步请求数， 默认1
              maxInitialRequests: 1,    // 最大初始化请求书，默认1
              name: () => {},              // 名称，此选项课接收 function
              cacheGroups: {                 // 这里开始设置缓存的 chunks
                priority: "0",                // 缓存组优先级 false | object |
                vendor: {                   // key 为entry中定义的 入口名称
                  chunks: "initial",        // 必须三选一： "initial" | "all" | "async"(默认就是异步)
                  test: /react|lodash/,     // 正则规则验证，如果符合就提取 chunk
                  name: "vendor",           // 要缓存的 分隔出来的 chunk 名称
                  minSize: 0,
                  minChunks: 1,
                  enforce: true,
                  maxAsyncRequests: 1,       // 最大异步请求数， 默认1
                  maxInitialRequests: 1,    // 最大初始化请求书，默认1
                  reuseExistingChunk: true   // 可设置是否重用该chunk（查看源码没有发现默认值）
                }
              }
            }
          },
         */
  },
  plugins: [
    // 压缩js
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false,
          drop_console: true, // 打包后去除console.log
          collapse_vars: true, // 内嵌定义了但是只用到一次的变量
          reduce_vars: true, // 提取出出现多次但是没有定义成变量去引用的静态值
          pure_funcs: ['console.log']
        }
      },
      sourceMap: prodConf.productionSourceMap,
      parallel: true // 使用多进程并行运行来提高构建速度
    }),

    // 作用域提升,提升代码在浏览器执行速度
    new webpack.optimize.ModuleConcatenationPlugin(),

    // 根据模块相对路径生成四位数hash值作为模块id
    new webpack.HashedModuleIdsPlugin(),

    // 将整个文件复制到构建输出指定目录下, 开启这个，我不知道为什么打包后会有一个bulma.css 迷
    // new CopyWebpackPlugin([
    //   {
    //     from: path.resolve(__dirname, '../static'),
    //     to: prodConf.assetsPath,
    //     ignore: ['.*']
    //   }
    // ]),

    // html配置
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, '../src/index.html'),
      // favicon: path.resolve(__dirname, '../static/favicon.ico'),
      inject: true
      // 压缩配置
      // minify: {
      //     //删除Html注释
      //     // removeComments: true,
      //     //去除空格
      //     collapseWhitespace: true,
      //     //去除属性引号
      //     removeAttributeQuotes: true
      // },
    })
  ]
});

// 查看打包内容
if (process.env.analyz_config_report) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
    .BundleAnalyzerPlugin;
  prod.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = prod;

```
webpack.server.conf.js
```
const webpack = require('webpack');
const path = require('path');
// const vueLoaderConfig = require('./vue-loader.conf');
const merge = require('webpack-merge');
const styleLoader = require('./style-loader');
// const baseConf = require('../config').base;
const baseConfig = require('./webpack.base.conf');
const nodeExternals = require('webpack-node-externals');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const isProd = process.env.NODE_ENV === 'production';
// const assetsPath = dir => path.posix.join(baseConf.assetsPath, dir);

module.exports = merge(baseConfig, {
  mode: isProd ? 'production' : 'development',

  // 这允许 webpack 以 Node 适用方式(Node-appropriate fashion)处理动态导入(dynamic import)，
  // 并且还会在编译 Vue 组件时，
  // 告知 `vue-loader` 输送面向服务器代码(server-oriented code)。
  target: 'node',
  devtool: '#source-map',
  entry: path.resolve(__dirname, '../src/entry-server.js'),

  module: {
    rules: styleLoader.styleLoader({
      extract: !isProd,
      sourceMap: !isProd
    })
  },

  // 此处告知 server bundle 使用 Node 风格导出模块(Node-style exports)
  output: {
    filename: 'server-bundle.js',
    libraryTarget: 'commonjs2'
  },
  // https://webpack.js.org/configuration/externals/#externals
  // https://github.com/liady/webpack-node-externals
  // 外置化应用程序依赖模块。可以使服务器构建速度更快，
  // 并生成较小的 bundle 文件。
  externals: nodeExternals({
    // do not externalize CSS files in case we need to import it from a dep
    // 不要外置化 webpack 需要处理的依赖模块。
    // 你可以在这里添加更多的文件类型。例如，未处理 *.vue 原始文件，
    // 你还应该将修改 `global`（例如 polyfill）的依赖模块列入白名单
    whitelist: /\.css$/
  }),
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
      ),
      'process.env.VUE_ENV': '"server"'
    }),

    // 这是将服务器的整个输出
    // 构建为单个 JSON 文件的插件。
    // 默认文件名为 `vue-ssr-server-bundle.json
    new VueSSRServerPlugin()
  ]
});

```
config/index.js
```
const path = require('path')
module.exports = {
  base: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/dist/',
    assetsPath: 'static'
  },
  dev: {
    env: 'development',
    publicPath: '/dist/',
    assetsPath: 'static',
    assetsSubDirectory: 'static',
    devtoolType: 'cheap-module-eval-source-map'
  },
  build: {
    env: 'production',
    publicPath: '/dist/',
    assetsPath: 'static',
    assetsSubDirectory: 'static',
    devtoolType: 'source-map'
  }
};

```