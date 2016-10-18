'use strict';
// create an always-enabled debug namespace.
var debugName = 'webpack';
var debug = require('debug');
debug.enable(debugName);
debug = debug(debugName);

var gulp = require('gulp');
var async = require('async');
var tar = require('gulp-tar-path');
var gzip = require('gulp-gzip');
var gutil = require('gulp-util');
var path = require('path');
var fs = require('fs');
var temp = require('temp');
var chalk = require('chalk');
var webpack = require('webpack');
var ProgressBarPlugin = require('progress-bar-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
//var DotEnvPlugin = require('webpack-dotenv-plugin');
var argv = require('yargs').argv;

const buildDir = 'dist/server';

var paths = {
  projectRoot: __dirname,
  appRoot: path.join(__dirname, 'server'),
  buildDir,
  buildRoot: path.join(__dirname, buildDir),
  outDir: path.join(__dirname, 'dist')
};

function copyFile(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function (err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function (err) {
    done(err);
  });
  wr.on("close", function (ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}

gulp.task('webpack', function (done) {
  Webpack(done).run(function (err, stats) {
    if (err) throw new gutil.PluginError('webpack', err);
    gutil.log('[webpack]', stats.toString({
      colors: true
    }));
  });
});

gulp.task('copy-configs', ['webpack'], function (done) {
  async.every(['package.json', 'config.json', 'datasources.json', '_run-in-production.sh'],
    (filename, cb)=> {
      copyFile(
        path.resolve(paths.appRoot, filename),
        path.resolve(paths.buildRoot, filename),
        cb
      )
    },
    (err, result)=> {
      done();
    });
});

gulp.task('zip-it-up', ['copy-configs'], function () {
  return gulp
    .src([paths.outDir])
    .pipe(tar('amino2.tar'))
    .pipe(gzip())
    .pipe(gulp.dest(paths.projectRoot));
});

gulp.task('default', ['zip-it-up']);

function Webpack(done) {
  debug(`Building into ${chalk.cyan.bold('./' + paths.buildDir)}`);

  // if --save-instructions is omitted, we clean up the boot instructions
  // temp file automatically.
  if (!argv.saveInstructions)
    temp = temp.track();

  // use loopback-boot to compile the boot instructions and save them to a
  // temporary file. we create a resolve alias below so that
  // require('boot-instructions.json') will be resolved correctly.
  debug('Compiling boot instructions');

  var options = {
    appRootDir: paths.appRoot,
    config: require(path.join(paths.appRoot, 'config.json')),
    dataSources: require(path.join(paths.appRoot, 'datasources.json')),
    models: require(path.join(paths.appRoot, 'model-config.json')),
    middleware: require(path.join(paths.appRoot, 'middleware.json')),
  };
  var compile = require('loopback-boot/lib/compiler');
  var ins = compile(options);

  // remove build and dataSources since they will be installed at
  // runtime from external files.
  delete ins.config;
  delete ins.dataSources;

  // rewrite all paths relative to the project root.
  var relative = function (p) {
    return './' + path.relative(paths.projectRoot, p).replace(/\\/g, '/');
  };
  var relativeSourceFiles = function (arr) {
    arr && arr.forEach(function (item) {
      if (item.sourceFile)
        item.sourceFile = relative(item.sourceFile);
    });
  };
  relativeSourceFiles(ins.models);
  relativeSourceFiles(ins.components);
  var middleware = ins.middleware && ins.middleware.middleware;
  relativeSourceFiles(middleware);
  var bootFiles = ins.files && ins.files.boot;
  if (bootFiles)
    bootFiles = ins.files.boot = bootFiles.map(relative);

  var instructionsFile = temp.openSync({prefix: 'boot-instructions-', suffix: '.json'});
  fs.writeSync(instructionsFile.fd, JSON.stringify(ins, null, argv.saveInstructions && '\t'));
  fs.closeSync(instructionsFile.fd);
  debug(`Saved boot instructions to ${chalk.cyan.bold(instructionsFile.path)}`);

  // Construct the dependency map for loopback-boot. It resolves all of the
  // dynamic module dependencies specified by the boot instructions:
  //  * model definition js files
  //  * component dependencies
  //  * middleware dependencies
  //  * boot scripts
  //  Note: model JSON files are included in the instructions themselves so
  //  are not bundled directly.
  var dependencyMap = {};
  var resolveSourceFiles = function (arr) {
    arr && arr.forEach(function (item) {
      if (item.sourceFile)
        dependencyMap[item.sourceFile] = path.resolve(paths.projectRoot, item.sourceFile);
    });
  };
  resolveSourceFiles(ins.models);
  resolveSourceFiles(ins.components);
  resolveSourceFiles(middleware);
  bootFiles && bootFiles.forEach(function (boot) {
    dependencyMap[boot] = path.resolve(paths.projectRoot, boot);
  });

  // create the set of node_modules which we will externalise below. we skip
  // binary modules and loopback-boot which must be bundled by webpack in order
  // to resolve dynamic dependencies.
  var nodeModules = new Set;
  try {
    fs.readdirSync(path.join(paths.projectRoot, 'node_modules'))
      .forEach(function (dir) {
        if (dir !== '.bin' && dir !== 'loopback-boot') {
          nodeModules.add(dir);
        }
      });
  } catch (e) {
  }

  // we define a master externals handler that takes care of externalising
  // node_modules (largely copied from webpack-node-externals) except for
  // loopback-boot. We also externalise our config.json and datasources.json
  // configuration files.
  function externalsHandler(context, request, callback) {
    // externalise dynamic build files.
    // NOTE: if you intend to deploy these build files in the same
    // directory as the bundle, change the result to `./${m[1]}.json`
    var m = request.match(/(?:^|[\/\\])(config|datasources)\.json$/);
    if (m) {
      return callback(null, `./${m[1]}.json`);
      //return callback(null, `../../server/${m[1]}.json`);
    }
    // externalise if the path begins with a node_modules name or if it's
    // an absolute path containing /node_modules/ (the latter results from
    // loopback component and middleware dependencies).
    const pathBase = request.split(/[\/\\]/)[0];
    if (nodeModules.has(pathBase))
      return callback(null, 'commonjs ' + request);
    m = request.match(/[\/\\]node_modules[\/\\](.*)$/);
    if (m) {
      return callback(null, 'commonjs ' + m[1].replace(/\\/g, '/'));
    }
    // otherwise internalise (bundle) the request.
    callback();
  };

  return webpack({
    context: paths.projectRoot,
    entry: './server/server.js',
    target: 'node',
    devtool: 'source-map',
    externals: [
      externalsHandler
    ],
    output: {
      libraryTarget: 'commonjs',
      path: paths.buildRoot,
      filename: '[name].bundle.js',
      chunkFilename: '[id].bundle.js'
    },
    node: {
      __dirname: false,
      __filename: false
    },
    resolve: {
      extensions: ['', '.json', '.js'],
      modulesDirectories: ['node_modules'],
      alias: {
        'boot-instructions.json': instructionsFile.path
      }
    },
    plugins: [
      //begin-JReeme
      //The DotEnv-* plugins don't seem to work with new WebPack (>2.0) factories
      /*      new DotEnvPlugin({
       sample: './.env.default',
       path: './.env'
       }),*/
      new webpack.DefinePlugin({
        '__USING_WEBPACK__': true
      }),
      new CleanWebpackPlugin(buildDir, {
        root: __dirname
      }),
      //end-JReeme
      new ProgressBarPlugin({
        format: `  ${debugName} Packing: [${chalk.yellow.bold(':bar')}] ` +
        `${chalk.green.bold(':percent')} (${chalk.cyan.bold(':elapseds')})`,
        width: 40,
        summary: false,
        clear: false
      }),
      new webpack.ContextReplacementPlugin(/\bloopback-boot[\/\\]lib/, '', dependencyMap)
    ],
    module: {
      // suppress warnings for require(expr) since we are expecting these from
      // loopback-boot.
      exprContextCritical: false,
      loaders: [
        /*{
         test: /\.js$/i,
         include: [
         path.join(paths.projectRoot, 'server'),
         path.join(paths.projectRoot, 'common'),
         path.join(paths.projectRoot, 'node_modules', 'loopback-boot'),
         ],
         loader: 'babel'
         },*/
        {
          test: [/\.json$/i],
          loader: 'json-loader'
        }
      ]
    },
    stats: {colors: true, modules: true, reasons: true, errorDetails: true}
  }, function (err, stats) {
    done();
  });
}
