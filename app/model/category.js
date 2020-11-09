'use strict';

module.exports = app => {
  const { INTEGER, STRING, DATE, Op } = app.Sequelize;
  const Category = app.model.define('category', {
    uid: {
      type: INTEGER,
      unique: true,
    },
    content: STRING,
    createdAt: DATE,
    updatedAt: DATE,
  });

  Category.getChange = async function(uid, time) {
    return this.findOne({
      where: {
        uid,
        updatedAt: {
          [Op.gt]: time,
        },
      },
    });
  };

  return Category;
};
