'use strict';

const R = require('../../../utils/R');
const BaseController = require('../base');

class CaptchaController extends BaseController {
  async get() {
    const { ctx, app } = this;
    try {
      const { uuid, captcha } = await app.captcha.gen();
      // disable browser cache for captcha
      ctx.append('Cache-Control', 'no-store');
      return R.success(ctx, {
        uuid,
        captcha,
      });
    } catch (err) {
      console.error('Generate captcha error', err);
      return R.error(ctx, 'Cannot generate captcha.', err);
    }
  }
}

module.exports = CaptchaController;
