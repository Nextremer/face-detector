const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  entry: __dirname + '/face-detector.js',
  output: {
    path: './',
    // publicPath: '/',
    filename: 'index.js',
    library: 'face-detector',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel'
    }]
  },
  plugins: [],
  externals: [ nodeExternals() ]
}

