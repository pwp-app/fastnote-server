'use strict';

const crypto = require('crypto');

const hashTimes = 32;

// password do multi time sha256
const passwordEncrypt = password => {
  let res = password;
  for (let i = 0; i < hashTimes; i++) {
    const hash = crypto.createHash('sha256');
    hash.update(res);
    res = hash.digest('hex');
  }
  return res;
};

const sha256 = str => {
  return crypto.createHash('sha256').update(str).digest('hex');
};

module.exports = {
  passwordEncrypt,
  sha256,
};
