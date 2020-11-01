'use strict';

const R = require('../../../utils/R');
const BaseController = require('../base');

class CaptchaController extends BaseController {
  async get() {
    const { ctx, app } = this;
    try {
      const { uuid, captcha } = await app.captcha.gen();
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
