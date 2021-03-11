'use strict';

const R = require('../../../utils/R');
const { Controller } = require('egg');

class CaptchaController extends Controller {
  async get() {
    const { ctx, app } = this;
    const { uuid, captcha } = await app.captcha.gen();
    // disable browser cache for captcha
    ctx.append('Cache-Control', 'no-store');
    return R.success(ctx, {
      uuid,
      captcha,
    });
  }
}

module.exports = CaptchaController;
