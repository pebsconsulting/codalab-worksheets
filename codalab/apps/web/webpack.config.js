var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require('path');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


module.exports = {
  devtool: 'source-map',
  entry: './static/js/worksheet/new_main.jsx',
  output: {
    path: path.resolve(__dirname, 'static/dist'),
    filename: 'new_main.js'
  },
  resolve: {
    alias: {
      '../../theme.config$': path.join(__dirname, 
          'static/less/codalab-semantic-theme/theme.config')  
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$|\.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['env', 'react'],
          plugins: ['transform-runtime'],
        }
      },
      {
        use: ExtractTextPlugin.extract({
          use: ['css-loader','less-loader',]
        }),
        test: /\.less$/
      },
      {
        test: /\.jpe?g$|\.gif$|\.png$|\.ttf$|\.eot$|\.svg$/,
        use: 'file-loader?name=[name].[ext]?[hash]'
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&mimetype=application/fontwoff'
      },
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].css',
    }),
    new BundleAnalyzerPlugin({
      analyzerHost: '0.0.0.0',
      analyzerPort: 8088,
    }),
    /*
    new webpack.DefinePlugin({
      "process.env": { 
        NODE_ENV: JSON.stringify("production") 
      }
    }),
    */
  ]
};
