import path from 'path';
import fs from 'fs';
import LRU from 'lru-cache';
import KoaRouter from 'koa-router';
import { createBundleRenderer } from 'vue-server-renderer';
// import { create } from 'domain';
// import serverBundle from '../dist/vue-ssr-server-bundle.json';
// import clientManifest from '../dist/vue-ssr-client-manifest.json';

const router = KoaRouter();
const isProduction = process.env.Node_ENV === 'production';
const resolve = file => path.resolve(__dirname, file);

const template = fs.readFileSync(resolve('src/index.html'), 'utf-8');
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
  const context = {
    url: ctx.url
  };

  return new Promise((resolve, reject) => {
    renderer.renderToString(context, (err, html) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      resolve(html);
    });
  });
};

export const ssr = async app => {
  let renderer;
  if (isProduction) {
    const [serverBundle, clientManifest] = await Promise.all(
      import('../dist/vue-ssr-server-bundle.json'),
      import('../dist/vue-ssr-client-manifest.json')
    );
    renderer = createRenderer(serverBundle, clientManifest);
  } else {
    const createApp = await import('../src/entry-server');
    // renderer = await createApp(context)
    // .then(app => {
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
  }

  router.get('*', async (ctx, next) => {
    // 提示webpack还在工作
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
