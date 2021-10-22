/* eslint valid-jsdoc: "off" */

'use strict';

const path = require('path');

module.exports = () => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = {};

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
    dialectOptions: {
      charset: 'utf8mb4',
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      paranoid: false,
      underscored: true,
      freezeTableName: true,
    },
  };

  config.mailTemplate = {
    path: path.resolve(__dirname, '../resources/email'),
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
