// 一个简单的空 CSS loader，用于在构建阶段忽略特定三方库的全局样式。
// Webpack 会将被该 loader 处理的 CSS 视为一个空模块。

module.exports = function emptyCssLoader() {
  return "";
};
