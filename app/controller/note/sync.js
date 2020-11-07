'use strict';

const R = require('../../../utils/R');
const { httpError } = require('../../utils/httpError');
const BaseController = require('../base');

const validateRules = {
  diff: {
    lastSync: { required: true, type: 'dateTime' },
  },
  upload: {
    notes: { required: true, type: 'string' },
    deleted: { required: false, type: 'string' },
  },
};

class SyncController extends BaseController {
  async diff() {
    const { ctx } = this;
    try {
      ctx.validate(validateRules.diff, ctx.query);
    } catch (err) {
      return httpError(ctx, 'inputError', null, err.message);
    }
    // get uid
    const { uid } = ctx.state.user;
    // fetch updated notes
    const { lastSync } = ctx.query;
    try {
      const updatedNotes = await ctx.model.Note.getUpdatedSince(uid, lastSync);
      const deletedLogs = await ctx.model.DeleteLog.getCreatedSince(uid, lastSync);
      if (updatedNotes) {
        return R.success(ctx, {
          notes: updatedNotes,
          deleted: deletedLogs,
        });
      }
    } catch (err) {
      console.log('Get recent update notes error: ', err);
      return httpError(ctx, 'unknownError');
    }
  }
  async update() {
    const { ctx, service } = this;
    try {
      ctx.validate(validateRules.upload);
    } catch (err) {
      return httpError(ctx, 'inputError', null, err.message);
    }
    // get uid
    const { uid } = ctx.state.user;
    // update notes in database
    let notes;
    try {
      notes = JSON.parse(ctx.request.body.notes);
    } catch (err) {
      return httpError(ctx, 'requestParamError');
    }
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
      try {
        deleted = JSON.parse(ctx.request.body.deleted);
      } catch (err) {
        return httpError(ctx, 'requestParamError');
      }
      if (deleted && Array.isArray(deleted) && deleted.length > 0) {
        try {
          const deleteRes = await service.sync.delete(uid, deleted);
          if (!deleteRes) {
            return httpError(ctx, 'updateDataFailed');
          }
        } catch (err) {
          console.error('Delete notes error: ', err);
          return httpError(ctx, 'updateDataFailed');
        }
      }
    }
    return R.success(ctx, updated);
  }
}

module.exports = SyncController;
