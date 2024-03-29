'use strict';

/** @type Egg.EggPlugin */
module.exports = {
  static: {
    enable: false,
  },
  jwt: {
    enable: true,
    package: 'egg-jwt',
  },
  cors: {
    enable: true,
    package: 'egg-cors',
  },
  redis: {
    enable: true,
    package: 'egg-redis',
  },
  sequelize: {
    enable: true,
    package: 'egg-sequelize',
  },
  validate: {
    enable: true,
    package: 'egg-validate',
  },
  mailer: {
    enable: true,
    package: 'egg-mailer',
  },
  mailTemplate: {
    enable: true,
    package: 'egg-mail-template',
  },
  trekCaptcha: {
    enable: true,
    package: 'egg-trek-captcha',
  },
};
