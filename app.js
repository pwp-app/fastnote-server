'use strict';

module.exports = app => {
  // 注入方法
  app.once('server', server => {
    server.keepAliveTimeout = 30000;
  });
  if (process.env.NODE_ENV === 'dev') {
    app.beforeStart(async () => {
      const force = process.env.CLEAN_DB === 'true';
      await app.model.sync({ force });
    });
  }
};
