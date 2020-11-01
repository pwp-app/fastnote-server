'use strict';

const Service = require('egg').Service;
const { sec } = require('../../utils/time');
const { genRandomCode } = require('../utils/utils');
const { getMailOptions } = require('../utils/mail');
const { passwordEncrypt } = require('../utils/encrypt');

class UserService extends Service {
  async add(user) {
    const { ctx } = this;
    await ctx.model.User.create({
      ...user,
      password: passwordEncrypt(user.password),
    });
  }
  async checkUsername(username) {
    const { ctx, app } = this;
    // fetch cache in redis
    const cacheKey = `username-existed-${username}`;
    const cached = await app.redis.exists(cacheKey);
    if (cached) {
      return true;
    }
    const res = await ctx.model.User.has({ username });
    if (res) {
      // 缓存保持3小时
      await app.redis.set(cacheKey, '', 'ex', sec('PT3H'));
    }
    return res;
  }
  async needCaptchaToLogin(username) {
    const { app } = this;
    const cacheKey = `login-failed-${username}`;
    const cached = await app.redis.get(cacheKey);
    if (cached && parseInt(cached, 10) > 5) {
      return true;
    }
    return false;
  }
  async countLoginFailed(username) {
    const { app } = this;
    const cacheKey = `login-failed-${username}`;
    const cached = await app.redis.get(cacheKey);
    if (!cached) {
      await app.redis.set(cacheKey, 1, 'ex', sec('PT5M'));
      return 1;
    }
    const times = parseInt(cached, 10) + 1;
    await app.redis.set(cacheKey, times, 'ex', sec('PT5M'));
    return times;
  }
  async sendVerifyMail(email) {
    const { app } = this;
    let template = app.mailTemplates.validation;
    const code = genRandomCode();
    template = template.replace(/\$\{code\}/gi, code);
    // set redis
    const controlKey = `mail-code-ctrl-${email}`;
    const codeKey = `mail-code-${email}`;
    if (await app.redis.exists(controlKey)) {
      return false;
    }
    await app.redis.set(controlKey, '', 'ex', sec('PT1M'));
    await app.redis.set(codeKey, code, 'ex', sec('PT30M'));
    await app.mailer.send({
      ...getMailOptions('validation'),
      to: email,
      html: template,
    });
    return true;
  }
  async verifyMail(email, code) {
    const { app } = this;
    const key = `mail-code-${email}`;
    const cachedCode = await app.redis.get(key);
    if (!cachedCode) {
      return {
        success: false,
        reason: 'codeNotExisted',
      };
    }
    if (code !== cachedCode) {
      return {
        success: false,
        reason: 'codeNotRight',
      };
    }
    await app.redis.del(key);
    return {
      success: true,
    };
  }
}

module.exports = UserService;
