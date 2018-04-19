const path = require('path')
module.exports = {
  base: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/dist/',
    assetsPath: 'static'
  },
  dev: {
    env: 'development',
    publicPath: '/dist/',
    assetsPath: 'static',
    assetsSubDirectory: 'static',
    devtoolType: 'cheap-module-eval-source-map'
  },
  build: {
    env: 'production',
    publicPath: '/dist/',
    assetsPath: 'static',
    assetsSubDirectory: 'static',
    devtoolType: 'source-map'
  }
};
