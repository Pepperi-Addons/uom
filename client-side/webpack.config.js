const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const singleSpaAngularWebpack = require('single-spa-angular-webpack5/lib/webpack').default;
const { merge } = require('webpack-merge');
// const deps = require('./package.json').dependencies;
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (config, options, env) => {
    config.plugins.push(
        new webpack.DefinePlugin({
          CLIENT_MODE: JSON.stringify(env.configuration),
        })
    )       
    
    if (env.configuration === 'Standalone') {
        return config;
    }
    else {
        const mfConfig = {
            output: {
              uniqueName: "uom_module"
            },
            optimization: {
              // Only needed to bypass a temporary bug
              runtimeChunk: false,
              minimize: true,
              minimizer: [
              new TerserPlugin({
                extractComments: false,
                terserOptions: {keep_fnames: /^.$/}
              })]
            },
            plugins: [
              new ModuleFederationPlugin({
                // remotes: {},
                name: "atd_config",
                filename: "atd_config.js",
                exposes: {
                  './AtdConfigComponent': './src/app/components/atd-config/index.ts',
                  './AtdConfigModule': './src/app/components/atd-config/index.ts',
                },
                shared: {
                  // ...deps,
                  "@angular/core": { eager:true,  singleton: true,   strictVersion: false  },
                  "@angular/common": { eager:true,  singleton: true,  strictVersion: false   },
                  "@pepperi-addons/ngx-lib": { eager:true,  singleton: true,  strictVersion: false   }
                }
              }),
            ],
          };
        const merged = merge(config, mfConfig);
        const singleSpaWebpackConfig = singleSpaAngularWebpack(merged, options);
        return singleSpaWebpackConfig;
    }


    // Feel free to modify this webpack config however you'd like to
};
