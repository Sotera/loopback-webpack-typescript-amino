(function () {
  let loopback = require('loopback');
  let server = module.exports = loopback();

  server.start = function () {
    return server.listen(function () {
      server.emit('started');
      let baseUrl = server.get('url').replace(/\/$/, '');
      console.log('Web server listening at: %s', baseUrl);

      let loopbackComponentExplorer = server.get('loopback-component-explorer');
      if (loopbackComponentExplorer) {
        let explorerPath = loopbackComponentExplorer.mountPath;
        console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
      }
    });
  };

  console.log('Starting server');
  /*  process.env.NODE_ENV = 'development';
   process.env.HMR_ENABLED = 1;*/
  process.env.NODE_ENV = 'production';
  process.env.HMR_ENABLED = 0;
  const boot = require('loopback-boot');
  boot(server, __dirname, function (err) {
    if (err) {
      throw err;
    }
    if (require.main === module) {
      server.start();
    }
  });
})();

