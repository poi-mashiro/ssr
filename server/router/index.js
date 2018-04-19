import path from 'path';
import fs from 'fs';
import KoaRouter from 'koa-router';

const router = new KoaRouter();

router
  .all('/api', async (ctx, next) => {
    console.log(ctx);
    console.log('');
    console.log('');
    console.log('');
    console.log('');
    ctx.body = JSON.stringify({ id: '123', text: 'aaaa' });
  })
  // .post('/api', async (ctx, next) => {
  //   ctx.body = ctx.request.body;
  // });

export default router;
