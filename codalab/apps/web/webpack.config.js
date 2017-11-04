var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  entry: './static/js/worksheet/new_main.jsx',
  output: {
    path: path.resolve(__dirname, 'static/dist'),
    filename: 'new_main.js'
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  }
};
