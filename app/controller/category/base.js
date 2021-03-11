'use strict';

const R = require('../../../utils/R');
const { httpError } = require('../../utils/httpError');
const { Controller } = require('egg');

const validateRules = {
  update: {
    categories: { required: true, type: 'string' },
  },
};

class CategoryController extends Controller {
  async get() {
    const { ctx } = this;
    const res = await ctx.model.Category.findOne({
      where: {
        uid: ctx.state.user.uid,
      },
    });
    return R.success(ctx, res);
  }
  async update() {
    const { ctx } = this;
    ctx.validate(validateRules.update);
    const res = await ctx.model.Category.upsert({
      uid: ctx.state.user.uid,
      content: ctx.request.body.categories,
    });
    if (!res) {
      return httpError(ctx, 'unknownError');
    }
    return R.success(ctx);
  }
}

module.exports = CategoryController;
