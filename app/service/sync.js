'use strict';

const Service = require('egg').Service;
const uuid = require('uuid');
const { sha256 } = require('../utils/encrypt');

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
  async delete(uid, syncIds) {
    const { ctx, app } = this;
    const { Op } = app.Sequelize;
    await ctx.model.Note.destory({
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
        logId: sha256(`${uid}${item}`),
        syncId: item,
      };
    });
    return await ctx.model.DeleteLog.bulkCreate(logs, {
      updateOnDuplicate: [],
    });
  }
}

module.exports = SyncService;
