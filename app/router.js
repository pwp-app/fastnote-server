'use strict';

const routes = {
  '/common': {
    '/ping': {
      method: 'get',
      target: 'common.ping.ping',
    },
    '/ping/auth': {
      method: 'get',
      target: 'common.ping.ping',
      auth: true,
    },
    '/captcha': {
      method: 'get',
      target: 'common.captcha.get',
    },
  },
  '/user': {
    '/login': {
      method: 'post',
      target: 'common.user.login',
    },
    '/register': {
      method: 'post',
      target: 'common.user.register',
    },
    '/sendMail': {
      method: 'post',
      target: 'common.user.sendMail',
    },
    '/refreshToken': {
      method: 'get',
      target: 'common.user.refreshToken',
    },
    '/getInfo': {
      method: 'get',
      target: 'common.user.getInfo',
    },
  },
  '/sync': {
    '/diff': {
      method: 'get',
      target: 'note.sync.diff',
      auth: true,
    },
    '/update': {
      method: 'post',
      target: 'note.sync.update',
      auth: true,
    },
  },
  '/note': {
    '/list': {
      method: 'get',
      target: 'note.base.getList',
      auth: true,
    },
    '/listByCat': {
      method: 'get',
      target: 'note.base.getListByCat',
      auth: true,
    },
    '/save': {
      method: 'post',
      target: 'note.base.save',
      auth: true,
    },
    '/delete': {
      method: 'post',
      target: 'note.base.delete',
      auth: true,
    },
  },
  '/category': {
    '/get': {
      method: 'get',
      target: 'category.base.get',
      auth: true,
    },
    '/update': {
      method: 'post',
      target: 'category.base.update',
      auth: true,
    },
  },
};

const getTarget = (obj, str) => {
  const parts = str.split('.');
  let method = obj;
  while (parts.length) {
    const part = parts.shift();
    method = method[part];
  }
  return method;
};

const buildRouter = (app, routes, base = '') => {
  const { router, controller, middleware } = app;
  const jwt = middleware.auth(app.config.jwt);
  const keys = Object.keys(routes);
  for (const key of keys) {
    if (routes[key].target) {
      // has function
      const { method, target, auth } = routes[key];
      if (auth) {
        router[method](base + key, jwt, getTarget(controller, target));
      } else {
        router[method](base + key, getTarget(controller, target));
      }
    } else {
      buildRouter(app, routes[key], base + key);
    }
  }
};

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => buildRouter(app, routes);
