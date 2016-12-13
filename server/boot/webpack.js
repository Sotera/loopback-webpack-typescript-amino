module.exports = function (app) {
    if (!parseInt(process.env.HMR_ENABLED)) {
        return;
    }
    var path = require('path');
    var webpack = require('webpack');
    var webpackConfig = require(path.resolve(__dirname, '../../client', 'webpack.config.js'));
    var compiler = webpack(webpackConfig);
    webpackConfig.output.publicPath = '/';
    app.use(require('webpack-dev-middleware')(compiler, {
        stats: {
            colors: true,
            chunks: false
        },
        publicPath: webpackConfig.output.publicPath,
        watchOptions: {
            aggregateTimeout: 300,
            poll: true
        },
        index: 'index.html'
    }));
};
//# sourceMappingURL=webpack.js.map