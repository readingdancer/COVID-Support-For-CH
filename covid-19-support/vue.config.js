const path = require('path')
const IN_PRODUCTION = process.env.NODE_ENV === 'production'

if (process.env.VUE_APP_THEME == null) {
  throw new Error('Please provide VUE_APP_THEME environment variable')
}

const themePath = './src/themes/' + process.env.VUE_APP_THEME + '/'
const themeContent = require(`${themePath}theme.content.js`)

const mapEnvVariables = {
  BASE_URL: process.env.BASE_URL,
  GA_ID: process.env.GA_ID,
  FB_ID: process.env.FB_ID,
  VUE_APP_THEME: process.env.VUE_APP_THEME
}

const themeMeta = Object.assign(mapEnvVariables, themeContent)

module.exports = {
  publicPath: IN_PRODUCTION && process.env.VUE_APP_THEME === 'CodeForAmericaDemoTheme' ? '/NC-COVID-Support/' : '/',
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: true
    }
  },
  chainWebpack: (config) => {
    config.plugin('html').tap((args) => {
      args[0].theme = themeMeta
      return args
    })
  },
  configureWebpack: {
    resolve: {
      alias: {
        ['theme.config$']: path.resolve(__dirname, themePath + '/theme.config.js'),
        ['theme.header$']: path.resolve(__dirname, themePath + '/components/theme.header.vue')
      }
    }
  },
  css: {
    loaderOptions: {
      sass: {
        prependData: `
       @import "./node_modules/bootstrap/scss/_functions.scss";
       @import "~bootstrap/scss/variables";
       @import "~bootstrap/scss/mixins";
       @import './src/scss/Mixins.scss';
       @import "./src/themes/${process.env.VUE_APP_THEME !== undefined ? process.env.VUE_APP_THEME : 'NCCovidSupport'}/SCSS/custom.scss";
      `
      },
      postcss: {
        plugins: [
          IN_PRODUCTION &&
            require('@fullhuman/postcss-purgecss')({
              content: [`./public/**/*.html`, `./src/**/*.vue`],
              defaultExtractor(content) {
                const contentWithoutStyleBlocks = content.replace(/<style[^]+?<\/style>/gi, '')
                return contentWithoutStyleBlocks.match(/[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g) || []
              },
              whitelist: ['html', 'body'],
              whitelistPatterns: [
                /-(leave|enter|appear)(|-(to|from|active))$/,
                /^(?!(|.*?:)cursor-move).+-move$/,
                /^router-link(|-exact)-active$/,
                /data-v-.*/,
                /leaflet/,
                /marker/,
                /list-group-item-sideNav/,
                /need-type/
              ]
            })
        ]
      }
    }
  }
}
