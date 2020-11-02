'use strict';

module.exports = app => {
  const { INTEGER, STRING, TEXT, DATE, Op } = app.Sequelize;
  const Note = app.model.define('note', {
    uid: INTEGER,
    noteId: INTEGER,
    syncId: {
      type: STRING,
      unique: true,
    },
    content: TEXT('long'),
    created_at: DATE,
    updated_at: DATE,
  });

  Note.prototype.getUpdatedSince = async function(uid, time) {
    return this.findAll({
      where: {
        uid,
        updated_at: {
          [Op.gt]: time,
        },
      },
    });
  };
};
