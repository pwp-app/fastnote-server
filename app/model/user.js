'use strict';

const { passwordEncrypt } = require('../utils/encrypt');
const moment = require('moment');

module.exports = app => {
  const { STRING, DATE } = app.Sequelize;

  const User = app.model.define('user', {
    username: STRING(30),
    password: STRING(64),
    email: STRING,
    createdAt: DATE,
    updatedAt: DATE,
    lastSignInAt: DATE,
    lastFetchToken: DATE,
  });

  User.has = async function(where) {
    const count = await this.count({
      where,
    });
    return count > 0;
  };

  User.verify = async function(username, password) {
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

  User.signIn = async function(username) {
    const now = new Date();
    return await this.update(
      {
        lastSignInAt: now,
        lastFetchToken: now,
      },
      {
        where: {
          username,
        },
      }
    );
  };

  User.checkRefresh = async function(userInfo) {
    const { uid, username } = userInfo;
    const stored = await this.findByPk(uid);
    if (!stored) {
      return false;
    }
    if (moment(stored.lastFetchToken).add(14, 'days').valueOf() > moment().valueOf()) {
      return false;
    }
    return stored.username === username;
  };

  User.recordRefresh = async function(uid) {
    return await this.update({
      lastFetchToken: new Date(),
    }, {
      where: {
        id: uid,
      },
    });
  };

  User.getInfo = async function(uid) {
    return await this.findOne({
      attributes: [ 'id', 'username', 'email' ],
      where: {
        id: uid,
      },
    });
  };

  return User;
};
