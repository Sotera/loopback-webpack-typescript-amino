var path = require('path');
var webpackMerge = require('webpack-merge');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');

const buildDir = 'dist/client';

module.exports = webpackMerge(commonConfig, {
  devtool: 'source-map',

  output: {
    path: path.resolve(__dirname, '../..', buildDir),
    publicPath: '/',
    filename: '[name].js',
    chunkFilename: '[id].chunk.js'
  },

  plugins: [
    new CleanWebpackPlugin(buildDir, {
      root: path.resolve(__dirname, '../..')
    }),
    new ExtractTextPlugin('[name].css'),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src', 'index.html')
    })
  ],

  devServer: {
    historyApiFallback: true,
    stats: 'minimal'
  }
});
