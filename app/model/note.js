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
    createdAt: DATE,
    updatedAt: DATE,
  });

  Note.getUpdatedSince = async function(uid, time) {
    return this.findAll({
      where: {
        uid,
        updatedAt: {
          [Op.gt]: time,
        },
      },
    });
  };

  return Note;
};
