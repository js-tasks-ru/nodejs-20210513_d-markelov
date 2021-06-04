const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

let subscribers = [];

router.get('/subscribe', async (ctx, next) => {
  let message;
  const promise = new Promise((resolved) => {
    subscribers.push(resolved);

    ctx.res.on('close', function() {
      subscribers.splice(subscribers.indexOf(resolved), 1);
    });
  });

  try {
    message = await promise;
  } catch (e) {
    throw e;
  }

  ctx.body = message;
});

router.post('/publish', async (ctx, next) => {
  const msg = ctx.request.body.message;

  if (!msg) {
    ctx.throw(400, 'message required');
  }

  subscribers.forEach(function(resolve) {
    resolve(String(msg));
  });

  subscribers = [];

  ctx.body = 'published';
});

app.use(router.routes());

module.exports = app;
