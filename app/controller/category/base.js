'use strict';

const R = require('../../../utils/R');
const { httpError } = require('../../utils/httpError');
const BaseController = require('../base');

const validateRules = {
  udpate: {
    categories: { required: true, type: 'string' },
  },
};

class CategoryController extends BaseController {
  async get() {
    const { ctx } = this;
    try {
      const res = await ctx.model.Category.findOne({
        where: {
          uid: ctx.state.user.uid,
        },
      });
      if (!res) {
        return httpError(ctx, 'unknownError');
      }
      return R.success(ctx, res);
    } catch (err) {
      console.error('Get category error: ', err);
      return httpError(ctx, 'unknownError', err);
    }
  }
  async update() {
    const { ctx } = this;
    try {
      ctx.validate(validateRules.update);
    } catch (err) {
      return httpError(ctx, 'inputError', null, err.message);
    }
    try {
      const res = await ctx.model.Category.create({
        uid: ctx.state.user.uid,
        content: ctx.request.body.categories,
      });
      if (!res) {
        return httpError(ctx, 'unknownError');
      }
      return R.success(ctx);
    } catch (err) {
      console.error('Create category error: ', err);
      return httpError(ctx, 'unknownError', err);
    }
  }
}

module.exports = CategoryController;
