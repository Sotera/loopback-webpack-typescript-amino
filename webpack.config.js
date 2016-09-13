const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const validate = require('webpack-validator');
const parts = require('./libs/parts');
const appDir = 'client';

const PATHS = {
    app: path.join(__dirname, appDir),
    style: [
        path.join(__dirname, 'node_modules', 'purecss'),
        path.join(__dirname, appDir, 'main.css')
    ],
    build: path.join(__dirname, 'client-build')
};

//module.exports = {
const common = {
// Entry accepts a path or an object of entries.
// We'll be using the latter form given it's
// convenient with more complex configurations.
    entry: {
        style: PATHS.style,
        app: PATHS.app
    },
    output: {
        path: PATHS.build,
        filename: '[name].js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Webpack demo'
        })
    ]
};

var config;

switch (process.env.npm_lifecycle_event) {
    case 'stats':
    case 'build':
        config = merge(
            common,
            {
                devtool: 'source-map',
                output: {
                    path: PATHS.build,
                    publicPath: '/loopback-webpack-typescript-amino/',
                    filename: '[name].[chunkhash].js',
                    chunkFilename: '[chunkhash].js'
                }
            },
            parts.clean(PATHS.build),
            parts.setFreeVariable(
                'process.env.NODE_ENV',
                'production'
            ),
            parts.extractBundle(
                {
                    name: 'vendor',
                    entries: ['react']
                }
            ),
            parts.minify(),
            parts.extractCSS(PATHS.style),
            parts.purifyCSS([PATHS.app])
        );
        break;
    default:
        config = merge(
            common,
            {
                devtool: 'eval-source-map'
            },
            parts.setupCSS(PATHS.style),
            parts.devServer({
                host: process.env.HOST,
                port: process.env.PORT
            }));
        break;
}

module.exports = validate(config, {
    quiet: true
});

