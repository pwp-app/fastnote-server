'use strict';

const moment = require('moment');

const sec = time => moment.duration(time).asSeconds();

module.exports = {
  sec,
  seconds: sec,
};
