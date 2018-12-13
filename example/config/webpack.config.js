var path = require('path');
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
    chunkFilename: 'js/chunks/[id].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  resolve: {
    alias: {
      '@lenic/api-factory': getPath('.')
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Api Factory Demo',
      template: getPath('example/config/index.html')
    })
  ],
  devServer: {
    host: '0.0.0.0',
    before: function(app) {
      app.post('/api/v1/students/1', function(req, res) {
        if (req.query.wait) {
          setTimeout(() => res.json({ custom: 'response' }), +req.query.wait);
        } else {
          res.json({ custom: 'response' });
        }
      });
    }
  }
};
