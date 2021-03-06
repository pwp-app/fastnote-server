'use strict';

const Service = require('egg').Service;
const uuid = require('uuid');

class SyncService extends Service {
  async update(uid, notes) {
    const { ctx } = this;
    // create notes to db
    const updateList = [];
    for (const note of notes) {
      const { noteId, syncId, category, content, forceTop } = note;
      updateList.push({
        uid,
        syncId: syncId ? syncId : uuid.v4(),
        noteId,
        category,
        content,
        forceTop: !!forceTop,
      });
    }
    return await ctx.model.Note.bulkCreate(updateList, {
      updateOnDuplicate: [ 'noteId', 'category', 'content', 'updatedAt' ],
    });
  }
  async delete(uid, syncIds) {
    const { ctx, app } = this;
    const { Op } = app.Sequelize;
    await ctx.model.Note.destroy({
      where: {
        uid,
        syncId: {
          [Op.in]: syncIds,
        },
      },
    });
    const logs = syncIds.map(item => {
      return {
        uid,
        syncId: item,
      };
    });
    return await ctx.model.DeleteLog.bulkCreate(logs, {
      ignoreDuplicates: true,
    });
  }
}

module.exports = SyncService;
