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
  },
};

class SyncController extends BaseController {
  async diff() {
    const { ctx, app } = this;
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
      const updatedNotes = await app.model.Note.getUpdatedSince(uid, lastSync);
      if (updatedNotes) {
        return R.success(ctx, {
          notes: updatedNotes,
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
    return R.success(ctx, updated);
  }
}

module.exports = SyncController;
