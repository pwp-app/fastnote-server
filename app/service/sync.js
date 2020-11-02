'use strict';

const Service = require('egg').Service;
const uuid = require('uuid');

class SyncService extends Service {
  async update(uid, notes) {
    const { ctx } = this;
    // create notes to db
    const updateList = [];
    for (const note of notes) {
      const { id, syncId, content } = note;
      updateList.push({
        uid,
        syncId: syncId ? syncId : uuid.v4(),
        noteId: id,
        content,
      });
    }
    return await ctx.model.Note.bulkCreate(updateList);
  }
}

module.exports = SyncService;
