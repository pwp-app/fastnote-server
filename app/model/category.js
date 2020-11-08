'use strict';

module.exports = app => {
  const { INTEGER, STRING, DATE } = app.Sequelize;
  const Category = app.model.define('category', {
    uid: INTEGER,
    content: STRING,
    createdAt: DATE,
    updatedAt: DATE,
  });

  return Category;
};
