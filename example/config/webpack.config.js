var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

function getPath(dir) {
  return path.join(process.cwd(), dir);
}

module.exports = {
  mode: 'development',
  devtool: false,
  entry: getPath('example/src/index.js'),
  output: {
    publicPath: '/',
    filename: 'js/[name].js',
    path: getPath('example/dist'),
    chunkFilename: 'js/chunks/[id].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  resolve: {
    alias: {
      '@lenic/api-factory': getPath('src'),
    },
  },
  plugins: [
    new webpack.NamedChunksPlugin(),
    new HtmlWebpackPlugin({
      title: 'Api Factory Demo',
      template: getPath('example/config/index.html'),
    }),
  ],
  devServer: {
    before: function(app) {
      app.post('/api/v1/students/1', function(req, res) {
        res.json({ custom: 'response' });
      });
    }
  }
};
