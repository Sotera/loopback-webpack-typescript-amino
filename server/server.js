require('dotenv').config();
if ((process.env.NODE_ENV !== 'production') && (process.env.NODE_ENV !== 'development')) {
  console.log("Please define environment variable NODE_ENV as 'development' or 'production'");
  process.exit(1);
}

function StartDevelopmentServer(server) {
  console.log("Starting server in 'development' mode");
  if (typeof __WEBPACK_IGNORE__ === 'undefined' || !__WEBPACK_IGNORE__) {
    const boot = require('loopback-boot');
    boot(server, __dirname, function (err) {
      if (err) {
        throw err;
      }
      if (require.main === module) {
        server.start();
      }
    });
  }
}

function StartProductionServerWithWebPackBundle(server) {
  console.log("Starting server in 'production' mode");
  // install source-map support so we get mapped stack traces.
  require('source-map-support').install();
  // Bootstrap the application, configure models, datasources and middleware.
  // Sub-apps like REST API are mounted via boot scripts.
  console.log('Executing boot instructions...');
  // instructions are provided by an explicit webpack resolve
  // alias (see gulpfile.js).
  var ins = require('boot-instructions.json');
  // install the external dynamic configuration.
  ins.config = require('./config.json');
  ins.dataSources = require('./datasources.json');
  var execute = require('loopback-boot/lib/executor');
  execute(server, ins, function (err) {
    if (err) {
      console.error(`Boot error: ${err}`);
      throw err;
    }
    console.log('Starting server...');

    // TODO: the require.main === module check fails here under webpack so we're not doing it.
    server.start();
  });
}

(function(){
  var loopback = require('loopback');
  var server = module.exports = loopback();

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

  if (process.env.NODE_ENV === 'production') {
    StartProductionServerWithWebPackBundle(server);
  } else if (process.env.NODE_ENV === 'development') {
    StartDevelopmentServer(server);
  }
})();

