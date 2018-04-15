import Koa from 'koa';
import fs from 'fs';
import path from 'path';
import bodyParser from 'koa-bodyparser';
import staticFlies from 'koa-static';
import Router from 'koa-router';

/*
 * 引入vue ssr
 *
 */
import { createRenderer, createBundleRenderer } from 'vue-server-renderer';
// import createApp from '../dist/serverapp';
import serverBundle from '../dist/vue-ssr-server-bundle.json';
import clientManifest from '../dist/vue-ssr-client-manifest.json';

const template = fs.readFileSync('src/index.html', 'utf-8');
// const renderer = createRenderer();
const renderer = createBundleRenderer(serverBundle, {
  template,
  clientManifest
});
// console.log(renderer)
/*
 * Vue ssr end
 *
 */
const app = new Koa();

// 使用post处理中间件
app.use(bodyParser());

// 设置静态资源路径
app.use(staticFlies(path.join(__dirname, '../dist/')));

app.use(async ctx => {
  console.log(ctx.url);
  if (ctx.req.url === '/favicon.ico') {
    return;
  }
  const context = { url: ctx.req.url };

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
  // await createApp(context).then(app => {
  //   renderer.renderToString(app, (err, html) => {
  //     console.log(err, html);
  //     if (err) {
  //       if (err.code === 404) {
  //         ctx.status = 404;
  //         ctx.body = 'Page not found';
  //       } else {
  //         ctx.status = 500;
  //         ctx.body = 'Internal Server Error';
  //       }
  //     } else {
  //       ctx.body = html;
  //     }
  //   });
  // });
});

app.listen(3000, () => {
  console.log('starting at port 3000');
});
