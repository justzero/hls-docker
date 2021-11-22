const Koa = require('koa');
const Router = require('koa-router');
const BodyParser = require('koa-bodyparser');
const {main, livePush, liveDown} = require('./m')

// 创建一个Koa对象表示web app本身:
const app = new Koa();
const router = new Router();
const bodyparser= new BodyParser();

// 对于任何请求，app将调用该异步函数处理请求：
app.use(async (ctx, next) => {
  console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
  await next();
});

// middleware的顺序很重要，这个koa-bodyparser必须在router之前被注册到app对象上
app.use(bodyparser);

router.get('/', async (ctx, next) => {
  ctx.response.body = `<h1>Hello, Koa2</h1>`;
});

router.get('/hello/:name', async (ctx, next) => {
  let name = ctx.params.name;
  ctx.response.body = `<h1>Hello, ${name}</h1>`
});

router.post('/live/:name', async (ctx, next) => {
	/*
	{
		in: 'video', // local video name
		out: 'out-3', // save video name
		outTime: 30, // save video time
	}
	*/
  let name = ctx.params.name;
  const data = ctx.request.body
  const cctv1Live = 'http://cctvalih5ca.v.myalicdn.com/live/cctv1_2/index.m3u8'
  let liveUri = ''
  console.log(data)
  if (name === 'push') {
	liveUri = livePush(data.in, cctv1Live, 60 * 5)
	setTimeout(() => {
		liveDown(liveUri, data.out, ~~data.outTime)
	}, 60 * 1000)
  }
  const base = (process.env.NODE_ENV === 'production') ? '' : 'http://localhost:8080'
  ctx.response.body = {
	  live: {
		  url: base + liveUri.replace(/live/ig, 'hls') + '.m3u8',
		  rtmp: base.replace(/http/ig, 'rtsp') + liveUri
	  }
  }
});

app.use(router.routes())
app.listen(3000);