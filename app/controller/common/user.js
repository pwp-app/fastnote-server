'use strict';

const BaseController = require('../base');
const R = require('../../../utils/R');
const { httpError } = require('../../utils/httpError');

const validateRules = {
  login: {
    username: { type: 'string', required: true, max: 30, min: 6 },
    password: { type: 'password', required: true, min: 64, max: 64 },
    captcha: { type: 'string', required: false, max: 4, min: 4 },
    captchaId: { type: 'string', required: false },
  },
  register: {
    username: { type: 'string', required: true, max: 30, min: 6 },
    password: { type: 'password', required: true, min: 64, max: 64 },
    confirmPassword: { type: 'password', required: true, min: 64, max: 64 },
    email: { type: 'email', required: true },
    emailCode: { type: 'string', required: true, max: 6, min: 6 },
  },
  sendMail: {
    captcha: { type: 'string', required: true, max: 4, min: 4 },
    captchaId: { type: 'string', required: true },
    email: { type: 'email', required: true },
  },
};

class UserController extends BaseController {
  async login() {
    const { ctx, app, service } = this;
    ctx.validate(validateRules.login);
    // check if user existed
    const { username } = ctx.request.body;
    if (!service.user.checkUsername(username)) {
      return httpError(ctx, 'userCredentialError');
    }
    // check if login need captcha
    const { captcha, captchaId } = ctx.request.body;
    if (await service.user.needCaptchaToLogin(username)) {
      if (!captcha || !captchaId) {
        return httpError(ctx, 'captchaRequired');
      }
      // verify captcha
      const ret = await app.captcha.verify(captchaId, captcha);
      if (!ret || ret.success) {
        return httpError(ctx, 'captchaVerifyFailed');
      }
    }
    // verify user credential
    const { password } = ctx.request.body;
    const verifyRet = await ctx.model.User.verify(username, password);
    if (!verifyRet || !verifyRet.success) {
      return httpError(ctx, 'userCredentialError');
    }
    // generate jwt
    const { uid } = verifyRet;
    const payload = {
      username,
      uid,
    };
    const authToken = app.jwt.sign(payload, app.config.jwt.secret, {
      expiresIn: '3h',
    });
    const refreshToken = app.jwt.sign(payload, app.config.jwt.secret, {
      expiresIn: '14d',
    });
    await app.model.User.signIn(username);
    return R.success(ctx, {
      authToken,
      refreshToken,
    });
  }
  async register() {
    const { ctx, service } = this;
    ctx.validate(validateRules.register);
    // verify input
    const { username, password, confirmPassword } = ctx.request.body;
    if (password !== confirmPassword) {
      return httpError(ctx, 'confirmNotRight');
    }
    if (service.user.checkUsername(username)) {
      return httpError(ctx, 'usernameExisted');
    }
    // verify email
    const { email, emailCode } = ctx.request.body;
    const ret = await service.user.verifyMail(email, emailCode);
    if (!ret) {
      return httpError(ctx, 'unknownError');
    }
    if (!ret.success) {
      return httpError(ctx, ret.reason);
    }
    // add user to db
    try {
      await service.user.add({
        username,
        password,
        email,
      });
      return R.success(ctx);
    } catch (err) {
      return httpError(ctx, 'unknownError');
    }
  }
  async sendMail() {
    const { ctx, app, service } = this;
    ctx.validate(validateRules.sendMail);
    // verify captcha
    const { captcha, captchaId } = ctx.request.body;
    const captchaRet = app.captcha.verify(captchaId, captcha);
    if (!captchaRet || !captchaRet.success) {
      return httpError(ctx, 'captchaVerifyFailed');
    }
    // send email
    const { email } = ctx.request.body;
    try {
      const ret = await service.user.sendVerifyMail(email);
      if (!ret) {
        return httpError(ctx, 'cannotSendMail');
      }
      return R.success(ctx);
    } catch (err) {
      return httpError(ctx, 'unknownError', err);
    }
  }
}

module.exports = UserController;
