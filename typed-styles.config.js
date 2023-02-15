const configs = require('@enhanced-dom/webpack').configs

module.exports = configs.typedStylesConfigFactory({ raw: false, filesPaths: ['./src/checkbox.webcomponent.pcss'] })
