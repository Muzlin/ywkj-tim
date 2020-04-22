// 引入webpack基础配置
const base = require('./webpack.config')
module.exports = Object.assign({
  mode: 'production', // 发布模式
  // 排除外部库 不打包
  externals: {
  }
}, base)
