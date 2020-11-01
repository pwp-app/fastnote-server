'use strict';

const randomstring = require('randomstring');

const genRandomCode = () => {
  return randomstring.generate({
    length: 6,
    charset: 'numeric',
  });
};

module.exports = {
  genRandomCode,
};
