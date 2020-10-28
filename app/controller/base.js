'use strict';
const { Controller } = require('egg');

class BaseController extends Controller {
  success(data) {
    this.ctx.body = {
      code: 0,
      data,
    };
  }
}

module.exports = BaseController;
