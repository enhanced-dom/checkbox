const configs = require('@enhanced-dom/webpack').configs
const path = require('path')

module.exports = (_, argv) => {
  const willExport = argv.mode !== 'none'
  return configs.typedStylesConfigFactory({
    raw: true,
    filePaths: ['./src/checkbox.webcomponent.pcss'],
    outputPath: willExport ? path.resolve('./dist') : undefined,
  })
}
