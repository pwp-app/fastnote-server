'use strict';
const R = require('../../utils/R');

module.exports = config => {
  const auth = async (ctx, next) => {
    let token = ctx.request.header.authorization;
    if (token) {
      let decoded;
      token = token.replace('Bearer ', '');
      try {
        decoded = ctx.app.jwt.verify(token, config.secret);
        // check if refresh token
      } catch (err) {
        return R.error(ctx, 'Cannot verify idendification.', err);
      }
      if (!decoded) {
        return R.error(ctx, 'Cannot decode token.');
      }
      if (decoded.refresh) {
        return R.error(ctx, 'Wrong token type.');
      }
      // check if decoded token is right
      if (decoded.uid && decoded.username) {
        ctx.state.user = decoded;
        await next();
      } else {
        return R.error(ctx, 'Wrong information in token.');
      }
    } else {
      return R.error(ctx, 'Cannot get auth token.');
    }
  };
  return auth;
};
