var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  entry: './static/js/worksheet/search_bar.jsx',
  output: {
    path: path.resolve(__dirname, 'static/dist'),
    filename: 'search_bar.js'
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
