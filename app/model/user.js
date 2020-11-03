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
    updated_at: DATE,
    lastSignInAt: DATE,
    lastFetchToken: DATE,
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

  User.prototype.signIn = async function(username) {
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

  User.prototype.checkRefresh = async function(userInfo) {
    const { uid, username } = userInfo;
    const stored = await this.findById(uid);
    if (moment(stored.lastFetchToken).add(14, 'days').valueOf() > moment().valueOf()) {
      return false;
    }
    return stored.username === username;
  };

  User.prototype.recordRefresh = async function(uid) {
    return await this.update({
      lastFetchToken: new Date(),
    }, {
      where: {
        id: uid,
      },
    });
  };
};
