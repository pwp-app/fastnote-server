'use strict';

const moment = require('moment');

const sec = time => moment.duration(time).seconds();

module.exports = {
  sec,
  seconds: sec,
};
