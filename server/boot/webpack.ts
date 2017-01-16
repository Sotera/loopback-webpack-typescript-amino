import {WebpackConfig} from "../custom-typings";
module.exports = function (app) {
  if (process.env.BYPASS_WEBPACK || process.env.NODE_ENV === 'production') {
    return;
  }

  let path = require('path');
  let webpack = require('webpack');
  let webpackConfig: WebpackConfig = <any>require(path.resolve(__dirname, '../..', 'webpack.config.js'));

  //Setting the context is imperative
  webpackConfig.context = path.resolve(__dirname, '../..');
  //Necessary for the html plugin to work properly when serving the html from in-memory
  webpackConfig.output.publicPath = 'http://localhost:3000/';
  webpackConfig.output.path = '/';

  let compiler = webpack(webpackConfig);

  app.use(require('webpack-dev-middleware')(compiler, {
    stats: {
      colors: true,
      chunks: false
    },
    publicPath: webpackConfig.output.path,
    watchOptions: {
      aggregateTimeout: 300,
      poll: true
    },
    index: 'index.html'
  }));

  app.use(require('webpack-hot-middleware')(compiler, {
    log: console.log
  }));
};
