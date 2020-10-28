'use strict';

const R = require('../../../utils/R');
const BaseController = require('../base');

class PingController extends BaseController {
  async ping() {
    return R.success(this.ctx);
  }
}

module.exports = PingController;
