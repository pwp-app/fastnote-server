/* eslint valid-jsdoc: "off" */

'use strict';

const path = require('path');
const privateConfig = require('./config.private');

module.exports = () => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = privateConfig.cookie;

  // add your middleware config here
  config.middleware = [];

  config.onerror = {
    all: (err, ctx) => {
      if (ctx.status === 422) {
        ctx.body = JSON.stringify({
          code: 422,
          status: 'error',
          message: 'Request validation failed.',
        });
      } else {
        ctx.body = JSON.stringify({
          code: 500,
          status: 'error',
          message: 'Unknown internal error occured.',
          err: process.env.NODE_ENV === 'dev' ? err : null,
        });
      }
      // 统一视为正常回复，用code区分错误
      ctx.set({
        'Content-Type': 'application/json',
      });
      ctx.status = 200;
    },
  };

  config.sequelize = {
    dialect: 'mysql',
    ...privateConfig.mysql,
  };

  config.redis = {
    client: privateConfig.redis,
  };

  config.mailer = privateConfig.mailer;

  config.mailTemplate = {
    path: path.resolve(__dirname, '../resources/email'),
  };

  config.jwt = {
    secret: privateConfig.jwt,
  };

  config.security = {
    csrf: {
      enable: false,
      ignoreJSON: true,
    },
  };

  config.cors = {
    origin: '*',
    allowMethods: 'GET,POST',
  };

  config.trekCaptcha = {
    size: 4,
    style: -1,
    redis: true,
    expires: 300,
  };

  return {
    ...config,
  };
};
