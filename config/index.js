const path = require('path')
module.exports = {
  base: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/',
    assetsPath: 'static'
  },
  dev: {
    env: 'development',
    publicPath: '/',
    assetsPath: 'static',
    assetsSubDirectory: 'static',
    devtoolType: 'cheap-module-eval-source-map'
  },
  build: {
    env: 'production',
    publicPath: '/client/',
    assetsPath: 'static',
    assetsSubDirectory: 'static',
    devtoolType: 'source-map'
  }
}
