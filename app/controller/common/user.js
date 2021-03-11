'use strict';

const { Controller } = require('egg');
const R = require('../../../utils/R');
const { httpError } = require('../../utils/httpError');
const { passwordEncrypt } = require('../../utils/encrypt');

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
    emailCaptcha: { type: 'string', required: true, max: 6, min: 6 },
  },
  sendMail: {
    captcha: { type: 'string', required: true, max: 4, min: 4 },
    captchaId: { type: 'string', required: true },
    email: { type: 'email', required: true },
  },
  refreshToken: {
    token: { type: 'string', required: true },
  },
};

class UserController extends Controller {
  async login() {
    const { ctx, app, service } = this;
    ctx.validate(validateRules.login);
    // check if user existed
    const { username } = ctx.request.body;
    if (!(await service.user.checkUsername(username))) {
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
      if (!ret || !ret.success) {
        return httpError(ctx, 'captchaVerifyFailed');
      }
    }
    // verify user credential
    const { password } = ctx.request.body;
    const verifyRet = await ctx.model.User.verify(username, password);
    if (!verifyRet || !verifyRet.success) {
      service.user.countLoginFailed(username);
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
    const refreshToken = app.jwt.sign(
      {
        ...payload,
        refresh: true,
      },
      app.config.jwt.secret,
      {
        expiresIn: '14d',
      }
    );
    service.user.clearLoginFailed(username);
    await ctx.model.User.signIn(username);
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
    if (await service.user.checkUsername(username)) {
      return httpError(ctx, 'usernameExisted');
    }
    // verify email
    const { email, emailCaptcha } = ctx.request.body;
    const ret = await service.user.verifyMail(email, emailCaptcha);
    if (!ret) {
      return httpError(ctx, 'unknownError');
    }
    if (!ret.success) {
      return httpError(ctx, ret.reason);
    }
    // add user to db
    await service.user.add({
      username,
      password: passwordEncrypt(password),
      email,
    });
    return R.success(ctx);
  }
  async sendMail() {
    const { ctx, app, service } = this;
    ctx.validate(validateRules.sendMail);
    // verify captcha
    const { captcha, captchaId } = ctx.request.body;
    const captchaRet = await app.captcha.verify(captchaId, captcha);
    if (!captchaRet || !captchaRet.success) {
      return httpError(ctx, 'captchaVerifyFailed');
    }
    // send email
    const { email } = ctx.request.body;
    const ret = await service.user.sendVerifyMail(email);
    if (!ret) {
      return httpError(ctx, 'cannotSendMail');
    }
    return R.success(ctx);
  }
  async refreshToken() {
    const { ctx, app } = this;
    ctx.validate(validateRules.refreshToken, ctx.query);
    // decode token
    const { token } = ctx.query;
    const decoded = ctx.app.jwt.verify(token, app.config.jwt.secret);
    if (!decoded.refresh) {
      return httpError('tokenInvalid');
    }
    // verify user info
    const res = ctx.model.User.checkRefresh(decoded);
    if (!res) {
      return httpError('tokenInvalid');
    }
    // return signed token
    const payload = {
      username: decoded.username,
      uid: decoded.uid,
    };
    const authToken = app.jwt.sign(payload, app.config.jwt.secret, {
      expiresIn: '3h',
    });
    const refreshToken = app.jwt.sign(
      {
        ...payload,
        refresh: true,
      },
      app.config.jwt.secret,
      {
        expiresIn: '14d',
      }
    );
    await ctx.model.User.recordRefresh(decoded.uid);
    return R.success(ctx, {
      authToken,
      refreshToken,
    });
  }
  async getInfo() {
    const { ctx } = this;
    const res = await ctx.model.User.getInfo(ctx.state.user.uid);
    if (!res) {
      return httpError(ctx, 'unknownError');
    }
    return R.success(ctx, res);
  }
}

module.exports = UserController;
