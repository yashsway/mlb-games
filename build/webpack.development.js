const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

const webpackConfig = {
  devtool: '#cheap-module-eval-source-map',
  devServer: {
    historyApiFallback: true,
  },
  performance: {
    hints: false,
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true,
    }),
    new FriendlyErrorsPlugin(),
    new webpack.LoaderOptionsPlugin({
      infrastructureLogging: {
        level: 'info',
      },
    })
  ],
};

module.exports = webpackConfig;
