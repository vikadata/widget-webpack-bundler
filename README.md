# @vikadata/widget-webpack-bundler

这是一个可以与 @vikadata/widget-cli@beta 一起使用的 webpack 打包工具。让你拥有自定义 webpack 配置能力。

## 安装

此依赖为维格小程序的依赖，请在维格小程序目录下运行

```
  yarn add @vikadata/widget-webpack-bundler --dev
```

## 如何使用

创建一个`customize.config.js`文件

``` js
const createBundler = require('@vikadata/widget-webpack-bundler').default;

function createConfig(config) {
    // 在这里添加你需要的配置
    return config;
}

exports.default = createBundler(createConfig);

```

## 示例

这里是一个示例，让小程序支持 less 预处理器

``` js
const createBundler = require('@vikadata/widget-webpack-bundler').default;

const createConfig = (config) => {
  config.module.rules.push({
    test: /\.less$/,
    use: [
      'style-loader',
      'css-loader',
      'less-loader'
    ],
    exclude: /node_modules/
  })
  return config;
}

exports.default = createBundler(createConfig);
```

