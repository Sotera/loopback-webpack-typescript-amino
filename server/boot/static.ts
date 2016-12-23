/*module.exports = function (app) {
  if(process.env.NODE_ENV !== 'production'){
    return;
  }
  let path = require('path');
  let loopback = require('loopback');
  let wwwPath = (process.env.NODE_ENV === 'production')
    ? '../..'
    : '../../src';
  console.log(path.resolve(__dirname, wwwPath));
  app.use(loopback.static(path.resolve(__dirname, wwwPath)));
};*/
