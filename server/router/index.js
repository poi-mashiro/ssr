import path from 'path';
import fs from 'fs';
import KoaRouter from 'koa-router';

const router = new KoaRouter();

router.get('/api', async (ctx, next) => {
  ctx.body = 123;
});

export default router;
