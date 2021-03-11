'use strict';

const R = require('../../../utils/R');
const { Controller } = require('egg');

class PingController extends Controller {
  async ping() {
    return R.success(this.ctx);
  }
}

module.exports = PingController;
