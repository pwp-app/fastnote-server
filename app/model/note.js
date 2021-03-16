'use strict';

module.exports = app => {
  const { INTEGER, STRING, BOOLEAN, TEXT, DATE, Op } = app.Sequelize;
  const Note = app.model.define('note', {
    uid: INTEGER,
    noteId: INTEGER,
    syncId: {
      type: STRING,
      unique: true,
    },
    category: {
      type: STRING,
      defaultValue: null,
    },
    forceTop: {
      type: BOOLEAN,
      defaultValue: false,
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

  Note.sync({ alter: true });

  return Note;
};
