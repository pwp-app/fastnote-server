'use strict';

const R = require('../../../utils/R');
const { httpError } = require('../../utils/httpError');
const BaseController = require('../base');

const validateRules = {
  getList: {
    page: { required: true, type: 'number', min: 1 },
    pageSize: { required: true, type: 'number', min: 1 },
  },
  save: {
    noteId: { required: true, type: 'number', min: 1 },
    syncId: { required: true, type: 'string' },
    content: { required: true, type: 'string' },
  },
  delete: {
    syncId: { required: true },
  },
};

class NoteController extends BaseController {
  async getList() {
    const { ctx } = this;
    try {
      ctx.validate(validateRules.getList, ctx.query);
    } catch (err) {
      return httpError(ctx, 'inputError', null, err.message);
    }
    // get notes by uid
    const { page, pageSize } = ctx.query;
    try {
      const res = await ctx.model.Note.findAll({
        where: {
          uid: ctx.state.user.uid,
        },
        order: [[ 'noteId', 'DESC' ]],
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });
      return R.success(ctx, res);
    } catch (err) {
      console.error('Get notes error: ', err);
      return httpError(ctx, 'unknownError', err);
    }
  }
  async save() {
    const { ctx } = this;
    try {
      ctx.validate(validateRules.save);
    } catch (err) {
      return httpError(ctx, 'inputError', null, err.message);
    }
    const { noteId, syncId, content } = ctx.request.body;
    try {
      const res = await ctx.model.Note.upsert({
        where: {
          uid: ctx.state.user.uid,
          noteId,
          syncId: syncId || null,
          content,
        },
      });
      if (!res) {
        return httpError(ctx, 'saveFailed');
      }
      return R.success(ctx, {
        syncId: res.syncId,
      });
    } catch (err) {
      console.error('Save not error: ', err);
      return httpError(ctx, 'unknownError', err);
    }
  }
  async delete() {
    const { ctx } = this;
    try {
      ctx.validate(validateRules.delete);
    } catch (err) {
      return httpError(ctx, 'inputError', null, err.message);
    }
    const { syncId } = ctx.request.body;
    try {
      const res = await ctx.model.Note.destory({
        where: {
          uid: ctx.state.user.uid,
          syncId,
        },
      });
      if (!res) {
        return httpError(ctx, 'deleteFailed');
      }
      return R.success(ctx);
    } catch (err) {
      console.error('Delete note error: ', err);
      return httpError(ctx, 'unknownError', err);
    }
  }
}

module.exports = NoteController;
