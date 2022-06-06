import * as webpack from 'webpack';
import * as path from 'path';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { getAssetsType, viaFileLoader } from './utils/file';

export interface IWebpackConfig extends webpack.Configuration {
  resolve: {
    extensions: Array<string>;
  };
  module: {
    rules: Array<webpack.RuleSetRule>;
  };
};

export interface IWebpackOptions {
  mode: 'development' | 'production',
  /** Path to first module to execute in the produced bundle. */
  entry: string;
  internal: {
    widgetConfig: any;
    assetsPublic?: string;
    releaseAssets: string;
    releaseCodeName: string;
    releaseCodeProdName: string;
    releaseCodePath: string;
  }
};

export const createBaseWebpackConfig = (option: IWebpackOptions): IWebpackConfig => {
  const {
    mode,
    entry,
    internal: { widgetConfig, assetsPublic, releaseAssets, releaseCodeProdName, releaseCodeName, releaseCodePath }
  } = option;
  return {
    context: path.resolve(process.cwd()),
    entry: {
      bundle: entry,
    },
    mode: mode,
    watch: mode === 'development',
    devtool: mode === 'development' ? 'source-map' : undefined,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [{
            loader: require.resolve('ts-loader'),
            options: {
              transpileOnly: true,
            },
          }, {
            loader: require.resolve('babel-loader'),
            options: {
              cwd: path.resolve(__dirname),
              presets: ['@babel/preset-typescript'],
              plugins: [['babel-plugin-styled-components', {
                namespace: widgetConfig.packageId,
              }]]
            }
          }],
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: [require.resolve('style-loader'), {
            loader: require.resolve('css-loader'),
            options: {
              modules: {
                getLocalIdent: (context: any, localIdentName: any, localName: string) => {
                  /** Enable sandbox allow external css */
                  return (widgetConfig.sandbox ? '' : widgetConfig.packageId) + localName;
                },
              }
            }
          }]
        },
        {
          test: /\.jsx?$/,
          use: {
            loader: require.resolve('babel-loader'),
            options: {
              cwd: path.resolve(__dirname),
              presets: [require.resolve('@babel/preset-env'), require.resolve('@babel/preset-react')],
              plugins: [[require.resolve('babel-plugin-styled-components'), {
                namespace: widgetConfig.packageId,
              }]]
            }
          },
          exclude: /node_modules/
        },
        {
          test: viaFileLoader,
          type: 'asset/resource',
          generator: {
            filename: (content: any) => {
              return `${releaseAssets}/${getAssetsType(content.filename)}/[hash][ext]`;
            },
            publicPath: mode === 'development' || assetsPublic == null ? undefined : `${assetsPublic}/widget/${widgetConfig.packageId}/`
          },
          exclude: /node_modules/
        }
      ],
    },
    externals: {
      react: {
        commonjs: 'react',
        commonjs2: 'react',
        amd: 'react',
        root: '_React',
      },
      'react-dom': {
        commonjs: 'react-dom',
        commonjs2: 'react-dom',
        amd: 'react-dom',
        root: '_ReactDom',
      },
      '@vikadata/components': {
        commonjs: '@vikadata/components',
        commonjs2: '@vikadata/components',
        amd: '@vikadata/components',
        root: '_@vikadata/components',
      },
      '@vikadata/core': {
        commonjs: '@vikadata/core',
        commonjs2: '@vikadata/core',
        amd: '@vikadata/core',
        root: '_@vikadata/core',
      },
      '@vikadata/widget-sdk': {
        commonjs: '@vikadata/widget-sdk',
        commonjs2: '@vikadata/widget-sdk',
        amd: '@vikadata/widget-sdk',
        root: '_@vikadata/widget-sdk',
      },
      '@vikadata/icons': {
        commonjs: '@vikadata/icons',
        commonjs2: '@vikadata/icons',
        amd: '@vikadata/icons',
        root: '_@vikadata/icons',
      }
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
    },
    output: {
      libraryTarget: 'umd',
      filename: mode === 'development' ? releaseCodeName : releaseCodeProdName,
      path: path.join(process.cwd(), releaseCodePath)
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.WIDGET_PACKAGE_ID': `'${widgetConfig.packageId}'`,
      }),
      new CleanWebpackPlugin()
    ],
  };
};

