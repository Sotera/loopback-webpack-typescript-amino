module.exports = function (app) {
  var path = require('path');
  var loopback = require('loopback');
  app.use(loopback.static(path.resolve(__dirname, '../../dist/client')));
  //if (typeof __USING_WEBPACK__ === 'undefined') { }
};
