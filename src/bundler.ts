import * as webpack from 'webpack';
import { createBaseWebpackConfig, IWebpackConfig, IWebpackOptions } from './webpack_config';

type CustomizeWebpackConfigFn = (webpackConfig: IWebpackConfig) => webpack.Configuration;

class Bundler {
  customizeWebpackConfigFn?: CustomizeWebpackConfigFn;

  constructor(customizeWebpackConfigFn: CustomizeWebpackConfigFn) {
    this.customizeWebpackConfigFn = customizeWebpackConfigFn;
  }

  private webpackCompiler(options: IWebpackOptions) {
    const baseConfig = createBaseWebpackConfig(options);
    const webpackConfig = this.customizeWebpackConfigFn
      ? this.customizeWebpackConfigFn(baseConfig)
      : baseConfig;
    return webpack(webpackConfig, (err: any, stats: any) => {
      if (err) {
        if ((err as any).details!) {
          console.error((err as any).details);
        }
        console.error(err.stack || err);
      }
  
      if (!stats) {
        return;
      }
  
      const info = stats.toJson();
  
      if (!info) {
        return;
      }
  
      if (stats.hasErrors()) {
        info.errors!.forEach((e: any) => {
          console.error(e.message);
        });
      }
  
      if (stats.hasWarnings()) {
        info.warnings!.forEach((e: any) => {
          console.warn(e.message);
        });
      }
  
      info.logging && console.log(info.logging);
    });
  };

  async startDevServer({
    emitBuildState,
    ...startOption
  }: any) {
    const compiler = this.webpackCompiler(startOption);
    compiler.hooks.compilation.tap('VikaCliStatePlugin', () => {});
    compiler.hooks.done.tap('VikaCliStatePlugin', (stats: webpack.Stats) => {
      if (!stats.hasErrors()) {
        emitBuildState({ status: 'success' });
      }
    });
  };

  async buildBundle({
    emitBuildState,
    ...startOption
  }: any) {
    this.startDevServer({
      emitBuildState,
      ...startOption
    })
  };
};

export default function createBundler(customizeWebpackConfigFn: CustomizeWebpackConfigFn) {
  return new Bundler(customizeWebpackConfigFn);
};