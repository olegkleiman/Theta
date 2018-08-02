'use strict';

var path = require('path');
const webpack = require('webpack');

var config = {
  entry: [
    'babel-polyfill',
    path.resolve(__dirname, './src/index.jsx')
  ],
  output: {
      path: __dirname + '/dist',
      filename: 'main.js'
  },
  stats: {
    colors: true,
    reasons: true,
    chunks: true
  },
  resolve: {
      extensions: ['*', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.(gif|png|svg)$/,
        loader: 'file-loader',
        options: {
          outputPath: 'img/'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: "style-loader" // creates style nodes from JS strings
          },
          {
            loader: "css-loader" // translates CSS into CommonJS
          }
        ]
      },
      {
        test: /\.(eot|ttf|woff)$/,
        use: [
          {
            loader: 'file-loader?name=dist/fonts/[name].[ext]',
            options: {
              name: './font/[hash].[ext]',
            },
          },
        ]
      }
    ]
  },
  // plugins: [
  //   new webpack.HotModuleReplacementPlugin()
  // ],
  devServer: {
    host: process.env.HOST,
    inline: true,
    hot: true
  }
};

module.exports = config;
