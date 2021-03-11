'use strict';

const R = require('../../../utils/R');
const { httpError } = require('../../utils/httpError');
const { Controller } = require('egg');

const validateRules = {
  diff: {
    lastSync: { required: true, type: 'dateTime' },
  },
  update: {
    notes: { required: true, type: 'string' },
    deleted: { required: false, type: 'string' },
  },
};

class SyncController extends Controller {
  async diff() {
    const { ctx } = this;
    ctx.validate(validateRules.diff, ctx.query);
    // get uid
    const { uid } = ctx.state.user;
    // fetch updated notes
    const { lastSync } = ctx.query;
    const updatedNotes = await ctx.model.Note.getUpdatedSince(uid, lastSync);
    const deletedLogs = await ctx.model.DeleteLog.getCreatedSince(uid, lastSync);
    const categories = await ctx.model.Category.getChange(uid, lastSync);
    // disable cache for diff data
    ctx.set({
      'Cache-Control': 'no-store',
    });
    return R.success(ctx, {
      notes: updatedNotes || [],
      deleted: deletedLogs || [],
      categories: categories ? categories.content : null,
    });
  }
  async update() {
    const { ctx, service } = this;
    ctx.validate(validateRules.update);
    // get uid
    const { uid } = ctx.state.user;
    // update notes in database
    const notes = JSON.parse(ctx.request.body.notes);
    if (!notes || !Array.isArray(notes)) {
      return httpError(ctx, 'requestParamError');
    }
    const updateRes = await service.sync.update(uid, notes);
    if (!updateRes) {
      return httpError(ctx, 'updateDataFailed');
    }
    // return syncId
    const updated = [];
    for (const item of updateRes) {
      updated.push({ id: item.noteId, syncId: item.syncId });
    }
    // do delete
    let deleted;
    if (ctx.request.body.deleted) {
      deleted = JSON.parse(ctx.request.body.deleted);
      if (deleted && Array.isArray(deleted) && deleted.length > 0) {
        const deleteRes = await service.sync.delete(uid, deleted);
        if (!deleteRes) {
          return httpError(ctx, 'updateDataFailed');
        }
      }
    }
    return R.success(ctx, updated);
  }
}

module.exports = SyncController;
