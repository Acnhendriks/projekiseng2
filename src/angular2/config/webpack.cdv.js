var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

const ENV = process.env.NODE_ENV = process.env.ENV = 'production';

module.exports = webpackMerge(commonConfig, {
  devtool: 'source-map',

  output: {
    path: helpers.root('../cordova/www'),
    publicPath: '',
    filename: './app/[name].[hash].js',
    chunkFilename: '[id].[hash].chunk.js'
  },

  htmlLoader: {
    minimize: false // workaround for ng2
  },

  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      } 
    }),
    new CleanWebpackPlugin(['www'], {
      root: helpers.root('../cordova/'),
      verbose: true,
      dry: false
    }),
    new ExtractTextPlugin('./[name].[hash].css'),
    new webpack.DefinePlugin({
      'process.env': {
        'ENV': JSON.stringify(ENV)
      }
    }),
    // temporary solution for can not load reference image in json
    // this temporary solutin copy all files from src img folder to dest img folder (which is not optimize)
    new CopyWebpackPlugin([
      {
        context: helpers.root(''),
        from: './assets/img/',
        to: './assets/img/'
      }
    ])
  ]
});
