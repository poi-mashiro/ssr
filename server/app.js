'use strict';
import Koa from 'koa';
import path from 'path';
import bodyParser from 'koa-bodyparser';
import staticFlies from 'koa-static';
import compress from 'koa-compress';
import router from './router/index';
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
