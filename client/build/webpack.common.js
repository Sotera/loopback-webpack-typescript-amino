var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var helpers = require('./helpers');

module.exports = {

  entry: {
    'polyfills': path.resolve(__dirname, '../src', 'polyfills.ts'),
    'vendor': path.resolve(__dirname, '../src', 'vendor.ts'),
    'app': path.resolve(__dirname, '../src', 'main.ts')
  },

  resolveLoader: {
    root: [
      path.resolve(__dirname, '../../node_modules')
    ]
  },

  resolve: {
    extensions: ['', '.js', '.ts'],
    alias: {
      'src': path.resolve(__dirname, '../src')
    }
  },

  module: {
    loaders: [
      {
        test: /\.ts$/,
        loaders: [
          'awesome-typescript-loader?tsconfig=' + path.resolve(__dirname, '..', 'tsconfig.json'),
          'angular2-template-loader'
        ]
      },
      {
        test: /\.html$/,
        loader: 'html'
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
        loader: 'file?name=assets/[name].[hash].[ext]'
      },
      {
        test: /\.css$/,
        exclude: helpers.root('src', 'app'),
        loader: ExtractTextPlugin.extract('style', 'css?sourceMap')
      },
      {
        test: /\.css$/,
        include: helpers.root('src', 'app'),
        loader: 'raw'
      }
    ]
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: ['app', 'vendor', 'polyfills']
    })
  ]
};
