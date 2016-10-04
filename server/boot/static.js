module.exports = function (app) {
  if (parseInt(process.env.HMR_ENABLED)) {
    return;
  }
  var path = require('path');
  var loopback = require('loopback');
  app.use(loopback.static(path.resolve(__dirname, '../../dist/client')));
};
