const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    devMiddleware: {
      publicPath: '/'
    },
    hot: true,
    open: true,
  },
  module: {
    rules: [
      // Other rules...
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: 'asset/resource', // This will handle image files
        generator: {
          filename: 'images/[hash][ext][query]' // Output images to dist/images folder with hash names
        }
      },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
  // Add your other webpack configurations here
};
