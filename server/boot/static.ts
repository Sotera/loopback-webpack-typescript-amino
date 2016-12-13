module.exports = function (app) {
  if (parseInt(process.env.HMR_ENABLED)) {
    return;
  }
  var path = require('path');
  var loopback = require('loopback');
  var wwwPath = (process.env.NODE_ENV === 'production')
    ? '../../dist/client'
    : '../../client/src';
  console.log(path.resolve(__dirname, wwwPath));
  app.use(loopback.static(path.resolve(__dirname, wwwPath)));
};
