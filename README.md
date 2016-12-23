
# Introduction

This rather awkwardly named project is an attempt to integrate several technologies I use to make web applications.
I wanted an easy way to start a project fulfilling the following requirements:

* Uses Angular2 (TypeScript) for the front end
* Uses LoopBack (JavaScript) for the back end
* Uses StrongLoop as the process manager
* Uses WebPack as the module bundler (for both client and server)
* Uses WebStorm 2016 as the development environment
* Keeps the development pain threshold appropriately low

Fortunately most of these requirements (with the glaring exception of WebStorm) are fulfilled elsewhere in the community
with high quality solutions. So what this project boiled down to in the end was an effort to integrate the following:

* The lovingly made https://github.com/akveo/ng2-admin admin console (client)
* The diligently researched https://github.com/geminiyellow/loopback-webpack-example (server)
* Some bits and pieces I had laying around to fit Node Express servers and HTML/JS clients into the WebStorm environment

## How I Did It

1. Grab latest akveo/ng2-admin project from github (https://github.com/akveo/ng2-admin.git)
2. Remove some unneeded config files:
  * .travis.yml
  * CHANGELOG.md
  * Dockerfile
  * _VERSION
  * build.sh
  * tslint.json
  * typedoc.json
  * docs folder
  * .github folder
  * .vscode folder
3. npm install, check that it works with 'npm run webpack-dev-server'
4. Add some NPM modules to support the loopback server
  * angular2-jwt
  * chokidar
  * compression
  * errorhandler
  * jsonwebtoken
  * loopback
  * loopback-boot
  * loopback-component-explorer
  * loopback-connector-mongodb
  * loopback-datasource-juggler
  * webpack-hot-middleware
5. Add loopback server.
  * Use strongloop 'slc loopback' to create a loopback project
  * Copy 'server' folder from loopback project to root of this project
  * Change '*.js' extension to '*.ts' in server and configure TypeScript for server
  * Add 'static.js' & 'webpack.ts' boot scripts to server. Comment out 'static'
  * In 'config/webpack.common.js' modify entry paths to use helpers.root. This will
    allow client to run from loopback server or webpack-dev-server
  * Replace 'awesome-typescript-loader' with 'awesome-typescript-loader?tsconfig=' + helpers.root('tsconfig.json'),
    so that it uses the correct tsconfig.json file
  * Use helpers.root for all occurrences of 'src/index.html'
  * Add following code block to end of webpack.dev.js. This will support HMR & browser refresh
  ```javascript
  for (var entryPoint in retVal.entry) {
    var webpackHotloaderEntryPoints = [
      'webpack-hot-middleware/client',
      'webpack/hot/dev-server'
    ]
    webpackHotloaderEntryPoints.push(retVal.entry[entryPoint]);
    retVal.entry[entryPoint] = webpackHotloaderEntryPoints;
  }
  retVal.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
  retVal.plugins.push(new webpack.HotModuleReplacementPlugin());
  retVal.plugins.push(new webpack.NoErrorsPlugin());
  ```
  * Add webpack:/// prefix to root URL in JavaScript debug configuration for WebStorm client debugging
  

## License

WTFPL (https://spdx.org/licenses/WTFPL)

## Thanks to

* The fine folks at https://github.com/akveo/ng2-admin whose project I used pretty much wholesale
* The diligent folks at https://github.com/geminiyellow/loopback-webpack-example whose project I literally used wholesale
