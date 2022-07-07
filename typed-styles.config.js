const configs = require('@enhanced-dom/webpack').configs

module.exports = configs.typedStylesConfigFactory({raw: true, filesPaths: ["./src/checkbox.webcomponent.pcss"]})
