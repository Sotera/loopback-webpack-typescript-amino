import kernel from './inversify.config';
import {VitaTasks, FullPipeline} from "firmament-vita";

function StartServer(server) {
  console.log('Starting server');
  //WebPack needs to ignore this code when building the bundle because it doesn't support
  //require.extensions (which are deprecated anyway) and loopback-boot uses them. This
  //conditional just suppresses the warnings.
  process.env.NODE_ENV = 'development';
  process.env.HMR_ENABLED = 1;
  //process.env.NODE_ENV = 'production';
  //process.env.HMR_ENABLED = 0;
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

(function () {
  let loopback = require('loopback');
  let server = module.exports = loopback();

  let vitaTasks: VitaTasks = kernel.get<VitaTasks>('VitaTasks');
  let fullPipeline: FullPipeline = kernel.get<FullPipeline>('FullPipeline');

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

  StartServer(server);
})();

