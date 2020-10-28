'use strict';

module.exports = {
  success: (ctx, data) => {
    ctx.status = 200;
    ctx.body = {
      code: 0,
      success: true,
      data,
    };
  },
  error: (ctx, message, err, code = -1) => {
    ctx.status = 200;
    ctx.body = {
      code,
      success: false,
      message,
      ...(process.env.NODE_ENV === 'dev' ? err : null),
    };
  },
};
