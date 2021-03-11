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
    html: (err, ctx) => {
      ctx.body = 'Error';
      if (process.env.NODE_ENV === 'dev') {
        ctx.body += `\n${err.message}\n${err.stack}`;
      }
    },
    json: (err, ctx) => {
      if (ctx.status === 422) {
        ctx.body = {
          code: 100000,
          success: false,
          message: '输入的内容有误',
          err: process.env.NODE_ENV === 'dev' ? err : null,
        };
      } else {
        ctx.body = {
          code: 500000,
          success: false,
          message: '发生了未知错误',
          err: process.env.NODE_ENV === 'dev' ? err : null,
        };
      }
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
