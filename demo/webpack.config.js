const path = require('path')
const babelConfigFactory = require('@enhanced-dom/babel').configFactory
const webpackConfigFactory = require('@enhanced-dom/webpack')

fs = require('fs')

module.exports = (env = {}, argv = {}) => {
  const isProduction = argv.mode === 'production'
  const publicPath = '/'
  const babelConfig = babelConfigFactory()

  return {
    mode: isProduction ? 'production' : 'development',
    entry: { bundle: [`./${path.relative(process.cwd(), path.resolve(__dirname, './index.tsx'))}`] },
    output: {
      filename: 'bundle-[contenthash].js',
      publicPath,
    },
    devtool: isProduction ? false : 'source-map',
    resolve: {
      modules: ['./node_modules', path.resolve('./node_modules')],
      extensions: ['.tsx', '.ts', '.json', '.js', '.jsx'],
    },
    optimization: {
      concatenateModules: true,
      minimize: isProduction,
      emitOnErrors: !isProduction,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: webpackConfigFactory.loaders.babelConfigFactory({ babel: babelConfig, cache: false }),
        },
        {
          test: /\.pcss$/,
          use: webpackConfigFactory.loaders.styleConfigFactory({
            extract: isProduction,
            sourceMap: !isProduction,
            parser: 'postcss',
            typedStyles: true,
            modules: true,
            raw: true,
          }),
        },
        {
          test: /\.css$/,
          use: webpackConfigFactory.loaders.styleConfigFactory({
            extract: isProduction,
            sourceMap: !isProduction,
            parser: 'postcss',
            typedStyles: false,
          }),
        },
        {
          test: /\.jsx?$/,
          include: /@enhanced-dom/,
          use: webpackConfigFactory.loaders.babelConfigFactory({ babel: babelConfig, cache: true }),
        },
      ],
    },
    plugins: [
      ...webpackConfigFactory.plugins.htmlConfigFactory({
        html: {
          minify: isProduction,
          title: 'Checkbox demo',
        },
      }),
      ...webpackConfigFactory.plugins.cssConfigFactory(),
    ],
    devServer: { historyApiFallback: true, port: 3000 },
  }
}
