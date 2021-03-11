'use strict';

const mailOptions = {
  validation: {
    from: 'noreply@pwp.app',
    subject: 'Fastnote 邮箱验证',
  },
};

const getOptions = type => {
  return mailOptions[type];
};

module.exports = {
  getMailOptions: getOptions,
};
