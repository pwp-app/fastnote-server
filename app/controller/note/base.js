'use strict';

const R = require('../../../utils/R');
const { httpError } = require('../../utils/httpError');
const { Controller } = require('egg');
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
    syncId: { required: true, type: 'string' },
  },
};

const toInt = function(source) {
  if (typeof source === 'undefined' || source === null) {
    return null;
  }
  return parseInt(source, 10);
};

class NoteController extends Controller {
  async getList() {
    const { ctx } = this;
    ctx.query.page = toInt(ctx.query.page);
    ctx.query.pageSize = toInt(ctx.query.pageSize);
    ctx.validate(validateRules.getList, ctx.query);
    // get notes by uid
    const { page, pageSize } = ctx.query;
    const res = await ctx.model.Note.findAll({
      where: {
        uid: ctx.state.user.uid,
      },
      order: [[ 'noteId', 'DESC' ]],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
    return R.success(ctx, res);
  }
  async getListByCat() {
    const { ctx } = this;
    ctx.query.page = toInt(ctx.query.page);
    ctx.query.pageSize = toInt(ctx.query.pageSize);
    ctx.validate(validateRules.getListByCat, ctx.query);
    const { category } = ctx.query;
    const { page, pageSize } = ctx.query;
    const res = await ctx.model.Note.findAll({
      where: {
        uid: ctx.state.user.uid,
        category: category === 'notalloc' ? null : category,
      },
      order: [
        [ 'forceTop', 'DESC' ],
        [ 'noteId', 'DESC' ],
      ],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
    if (!res) {
      return httpError(ctx, 'unknownError');
    }
    return R.success(ctx, res);
  }
  async save() {
    const { ctx } = this;
    ctx.request.body.noteId = toInt(ctx.request.body.noteId);
    ctx.validate(validateRules.save);
    const { noteId, syncId, category, content } = ctx.request.body;
    const upsertSyncId = syncId || uuid.v4();
    const res = await ctx.model.Note.upsert({
      uid: ctx.state.user.uid,
      noteId,
      syncId: upsertSyncId,
      category: category || null,
      content,
    });
    if (!res) {
      return httpError(ctx, 'saveFailed');
    }
    return R.success(ctx, {
      syncId: upsertSyncId,
    });
  }
  async delete() {
    const { ctx } = this;
    ctx.validate(validateRules.delete);
    const { syncId } = ctx.request.body;
    const t = await ctx.model.transaction();
    try {
      const uid = ctx.state.user.uid;
      const res = await ctx.model.Note.destroy({
        where: {
          uid,
          syncId,
        },
        transaction: t,
      });
      if (!res) {
        await t.rollback();
        return httpError(ctx, 'deleteFailed');
      }
      const record = {
        uid,
        syncId,
      };
      const recordRes = await ctx.model.DeleteLog.upsert(record, {
        transaction: t,
      });
      if (!recordRes) {
        await t.rollback();
        return httpError(ctx, 'deleteFailed');
      }
      await t.commit();
      return R.success(ctx);
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}

module.exports = NoteController;
