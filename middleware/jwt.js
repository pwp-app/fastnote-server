'use strict';
const R = require('../utils/R');

module.exports = config => {
  const jwt = async (ctx, next) => {
    const token = ctx.request.header.authorization;
    if (token) {
      try {
        const decode = ctx.app.jwt.verify(token, config.secret);
        // check if refresh token
        if (decode.refresh) {
          return R.error(ctx, 'Wrong token type.');
        }
        // check if decoded token is right
        if (decode.uid && decode.username) {
          ctx.state.auth = decode;
          await next();
        } else {
          return R.error(ctx, 'Wrong information in token.');
        }
      } catch (err) {
        return R.error(ctx, 'Cannot verify idendification.', err);
      }
    } else {
      return R.error(ctx, 'Cannot get auth token.');
    }
  };
  return jwt;
};
