const Koa = require('koa')
const fs = require('fs')
const path = require('path')
const app = new Koa()

const bodyParser = require('koa-bodyparser')
const static = require('koa-static')
// 使用ctx.body解析中间件
app.use(bodyParser())
const staticPath = './src'

app.use(static(
  path.join(__dirname, staticPath)
))

/**
 * 用Promise封装异步读取文件方法
 * @param  {string} page html文件名称
 * @return {promise}      
 */
function render(page) {
  return new Promise((resolve, reject) => {
    let viewUrl = `./src/${page}`
    fs.readFile(viewUrl, "binary", (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

const Router = require('koa-router')

// 子路由2
let page = new Router()
page.get('/', async (ctx) => {
  // console.log(ctx)
  ctx.body = await render('index.html')
}).get('/helloworld', async (ctx) => {
  ctx.body = 'helloworld page!'
})

// 装载所有子路由
let router = new Router()
router.use('/', page.routes(), page.allowedMethods())

// 加载路由中间件
app.use(router.routes()).use(router.allowedMethods())

app.use(async (ctx) => {
  let url = ctx.url
  // 从上下文的request对象中获取
  let request = ctx.request
  let req_query = request.query
  let req_querystring = request.querystring

  // 从上下文中直接获取
  let ctx_query = ctx.query
  let ctx_querystring = ctx.querystring

  ctx.body = {
    url,
    req_query,
    req_querystring,
    ctx_query,
    ctx_querystring
  }
})


app.listen(3000, () => {
  console.log('[demo] route-use-middleware is starting at port 3000')
})