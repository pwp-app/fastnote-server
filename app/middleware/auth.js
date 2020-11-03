'use strict';
const R = require('../../utils/R');

module.exports = config => {
  const auth = async (ctx, next) => {
    let token = ctx.request.header.authorization;
    if (token) {
      token = token.replace('Bearer ', '');
      try {
        console.log('token', token);
        const decode = ctx.app.jwt.verify(token, config.secret);
        // check if refresh token
        if (decode.refresh) {
          return R.error(ctx, 'Wrong token type.');
        }
        // check if decoded token is right
        if (decode.uid && decode.username) {
          ctx.state.user = decode;
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
  return auth;
};
