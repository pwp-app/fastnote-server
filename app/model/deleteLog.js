'use strict';

module.exports = app => {
  const { INTEGER, STRING, DATE, Op } = app.Sequelize;
  const DeleteLog = app.model.define('delete_log', {
    uid: INTEGER,
    logId: {
      type: STRING,
      unique: true,
    },
    syncId: STRING,
    createdAt: DATE,
    updatedAt: DATE,
  });

  DeleteLog.getCreatedSince = async function(uid, time) {
    return this.findAll({
      where: {
        uid,
        createdAt: {
          [Op.gt]: time,
        },
      },
    });
  };

  return DeleteLog;
};
