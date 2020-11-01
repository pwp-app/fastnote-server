'use strict';

const { passwordEncrypt } = require('../utils/encrypt');

module.exports = app => {
  const { STRING, DATE } = app.Sequelize;

  const User = app.model.define('user', {
    username: STRING(30),
    password: STRING(64),
    email: STRING,
    created_at: DATE,
    updated_at: DATE,
    last_sign_in_at: DATE,
  });

  User.prototype.has = async function(where) {
    const count = await this.count({
      where,
    });
    return count > 0;
  };

  User.prototype.verify = async function(username, password) {
    const user = await this.findOne({
      where: {
        username,
      },
    });
    return {
      success: user.password === passwordEncrypt(password),
      uid: user.id,
    };
  };

  User.prototype.signIn = async function() {
    return await this.update({ last_sign_in_at: new Date() });
  };
};
