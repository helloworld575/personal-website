/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  webpack: (config) => {
    const cssIgnorePattern = /@uiw[\\/](react-md-editor|react-markdown-preview)[\\/].*\.css$/;

    const emptyCssLoaderPath = path.resolve(__dirname, "empty-css-loader.js");

    // 在 oneOf 规则中优先忽略 @uiw 编辑器内部的 CSS，引入由 _app.tsx 控制
    const oneOfRule = config.module.rules.find((rule) => Array.isArray(rule.oneOf));
    if (oneOfRule && Array.isArray(oneOfRule.oneOf)) {
      oneOfRule.oneOf.unshift({
        test: cssIgnorePattern,
        use: emptyCssLoaderPath,
      });
    } else {
      // 兜底：直接在顶层 rules 中加入一条规则
      config.module.rules.unshift({
        test: cssIgnorePattern,
        use: emptyCssLoaderPath,
      });
    }

    return config;
  },
};

module.exports = nextConfig;
