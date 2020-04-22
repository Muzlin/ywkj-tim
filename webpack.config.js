// 引入path模块
const path = require('path')
module.exports = {
  // mode: 'development', // 模式 开发、发布等
  // 入口
  entry: {
    index: './lib/index.js', // 入口的名字 index 值为具体路径
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  // 输出
  output: {
    path: path.resolve(__dirname, 'dist/lib'), // 输出路径 因为操作系统不一致 所有需要path来处理
    library: '@ywkj/tim', // 库的名字
    libraryTarget: 'umd' // 输出格式 (umd/commonjs/amd)
  },
  module: {
  }
}
