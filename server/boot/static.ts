module.exports = function (app) {
  //This should be used only in production
  if(process.env.NODE_ENV !== 'production'){
    return;
  }
  let path = require('path');
  let loopback = require('loopback');
  let wwwPath = '../..';
  console.log(path.resolve(__dirname, wwwPath));
  app.use(loopback.static(path.resolve(__dirname, wwwPath)));
};
