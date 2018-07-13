const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Autoprefixer = require('autoprefixer');
const path = require('path');



module.exports = (env) => {
  const ifProd = plugin => env.prod ? plugin : undefined;
  const ifDev = plugin => env.dev ? plugin : undefined;
  const removeEmpty = array => array.filter(p => !!p);
  const mode = env.prod ? 'production' : 'development';
  return {
    devtool: ifDev('cheap-module-source-map'),
    mode,
    context: path.join(__dirname, '../'),
    entry: {
      app: removeEmpty([
        ifDev(`webpack-hot-middleware/client?http://localhost:${env.port}`),
        './src/index.ts'
      ]),
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json'],
    },
    output: {
      filename: env.prod ? '[name].[hash].js' : '[name].js',
      sourceMapFilename: env.prod ? '[name].[hash].map.js' : '[name].map.js',
      path: path.join(__dirname, '../build/'),
      // publicPath: '/', can uncomment if you want everything relative to root '/'
    },
    optimization: {
      minimize: env.prod,
      splitChunks: {
        chunks: 'all',
      }
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: env.prod
            ? 'awesome-typescript-loader?target=es5'
            : 'awesome-typescript-loader',
        },
        {
          test: /\.(css)$/,
          use:
            [
              env.dev || env.test ? 'style-loader' : MiniCssExtractPlugin.loader,
              `css-loader?modules=true&minimize=${env.prod}&-autoprefixer`,
              'postcss-loader'
            ]
        },
        {
          test: /\.(png|jpg)$/,
          use: 'url-loader?limit=8192'
        }
      ],
    },

    plugins: removeEmpty([
      new HtmlWebpackPlugin({
        template: path.join(__dirname, '../src/index.html'),
        filename: 'index.html',
        inject: 'body',
      }),
      new webpack.LoaderOptionsPlugin({
        minimize: env.prod,
        debug: env.dev,
        options: {
          context: __dirname,
          postcss: [Autoprefixer({ browsers: ['last 3 versions'] })],
        },
      }),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),

      new webpack.DefinePlugin({
        __DEVELOPMENT__: Boolean(env.dev),
        'process.env.NODE_ENV': JSON.stringify(mode),
      }),

      ifProd(new MiniCssExtractPlugin({
        filename: '[name].[hash].css',
      })),
    ]),
  };
};
