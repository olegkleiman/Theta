var path = require('path');
const webpack = require('webpack');

var config = {
  entry: [
    'react-hot-loader/patch',
    path.resolve(__dirname, './src/index.jsx')
  ],
  output: {
      path: __dirname + '/dist',
      filename: 'main.js'
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
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    host: process.env.HOST,
    hot: true
  }
};

module.exports = config;
