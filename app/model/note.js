'use strict';

module.exports = app => {
  const { INTEGER, STRING, TEXT, BOOLEAN, DATE, Op } = app.Sequelize;
  const Note = app.model.define('note', {
    uid: INTEGER,
    noteId: INTEGER,
    syncId: {
      type: STRING,
      unique: true,
    },
    content: TEXT('long'),
    deleted: {
      type: BOOLEAN,
      defaultValue: false,
    },
    created_at: DATE,
    updated_at: DATE,
  }, {
    defaultScope: {
      where: {
        deleted: false,
      },
    },
  });

  Note.getUpdatedSince = async function(uid, time) {
    return this.findAll({
      where: {
        uid,
        updated_at: {
          [Op.gt]: time,
        },
      },
    });
  };

  return Note;
};
