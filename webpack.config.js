const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: __dirname + '/face-detector.js',
  output: {
    path: './',
    // publicPath: '/',
    filename: 'index.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel?cacheDirectory=true'
    }]
  },
  plugins: [],
  externals: []
}

