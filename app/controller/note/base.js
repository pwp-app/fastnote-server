'use strict';

const R = require('../../../utils/R');
const { httpError } = require('../../utils/httpError');
const BaseController = require('../base');
const uuid = require('uuid');

const validateRules = {
  getList: {
    page: { required: true, type: 'int' },
    pageSize: { required: true, type: 'int' },
  },
  getListByCat: {
    page: { required: true, type: 'int' },
    pageSize: { required: true, type: 'int' },
    category: { required: true, type: 'string' },
  },
  save: {
    noteId: { required: true, type: 'int' },
    syncId: { required: false, type: 'string' },
    category: { required: false, type: 'string' },
    content: { required: true, type: 'string' },
  },
  delete: {
    syncId: { required: true },
  },
};

const toInt = function(source) {
  if (typeof source === 'undefined' || source === null) {
    return null;
  }
  return parseInt(source, 10);
};

class NoteController extends BaseController {
  async getList() {
    const { ctx } = this;
    try {
      ctx.query.page = toInt(ctx.query.page);
      ctx.query.pageSize = toInt(ctx.query.pageSize);
      console.log(ctx.query);
      ctx.validate(validateRules.getList, ctx.query);
    } catch (err) {
      console.log(err);
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
  async getListByCat() {
    const { ctx } = this;
    try {
      ctx.query.page = toInt(ctx.query.page);
      ctx.query.pageSize = toInt(ctx.query.pageSize);
      ctx.validate(validateRules.getListByCat, ctx.query);
    } catch (err) {
      return httpError(ctx, 'inputError', null, err.message);
    }
    const { category } = ctx.query;
    const { page, pageSize } = ctx.query;
    try {
      const res = await ctx.model.Note.findAll({
        where: {
          uid: ctx.state.user.uid,
          category: category === 'notalloc' ? null : category,
        },
        order: [[ 'noteId', 'DESC' ]],
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });
      if (!res) {
        return httpError(ctx, 'unknownError');
      }
      return R.success(ctx, res);
    } catch (err) {
      console.error('Get notes by category error: ', err);
      return httpError(ctx, 'unknownError', err);
    }
  }
  async save() {
    const { ctx } = this;
    try {
      ctx.request.body.noteId = toInt(ctx.request.body.noteId);
      ctx.validate(validateRules.save);
    } catch (err) {
      return httpError(ctx, 'inputError', null, err.message);
    }
    const { noteId, syncId, category, content } = ctx.request.body;
    try {
      const res = await ctx.model.Note.upsert({
        uid: ctx.state.user.uid,
        noteId,
        syncId: syncId || uuid.v4(),
        category: category || null,
        content,
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
