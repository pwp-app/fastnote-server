'use strict';

const routes = {
  '/common': {
    '/ping': {
      method: 'get',
      target: 'common.ping.ping',
      auth: false,
    },
    '/ping/auth': {
      method: 'get',
      target: 'common.ping.ping',
      auth: true,
    },
    '/captcha': {
      method: 'get',
      target: 'common.captcha.get',
      auth: false,
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
  const jwt = middleware.jwt(app.config.jwt);
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
