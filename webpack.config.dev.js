// 引入webpack基础配置
const base = require('./webpack.config')
module.exports = Object.assign({
  mode: 'development', // 开发模式
}, base)
