var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './index.js',
  output: {
    filename: '[name].js',
    path: 'dist',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'react'],
        }
      },
      {
        test: /\.json$/,
        loaders: ['json'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Hexagon Cartograms",
    }),
  ],
}
