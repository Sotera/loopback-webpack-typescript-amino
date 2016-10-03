//There are two ways we might be starting this up:
// 1) As a regular, old Express server. In this case __USING_WEBPACK__ will not be defined and we'll get
//    process.env using 'dotenv'
// 2) As a WebPack bundle. In this case __USING_WEBPACK__ will be defined and we'll get
//    process.env using the 'dotenv-webpack' plugin

//This is the "standard issue" loopback startup code. WebPack is not involved.
function StartServer(server) {
  console.log('Starting server');
  //WebPack needs to ignore this code when building the bundle because it doesn't support
  //require.extensions (which are deprecated anyway) and loopback-boot uses them. This
  //conditional just suppresses the warnings.
  if (typeof __USING_WEBPACK__ === 'undefined') {
    process.env.NODE_ENV = 'development';
    process.env.HMR_ENABLED = 1;
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

function StartWebPackServer(server) {
  console.log('Starting WebPack server');
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

(function () {
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

  if (typeof __USING_WEBPACK__ === 'undefined') {
    StartServer(server);
  } else {
    StartWebPackServer(server);
  }
})();

