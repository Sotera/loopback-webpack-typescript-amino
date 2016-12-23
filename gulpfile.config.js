'use strict';
var GulpConfig = (function () {
  function gulpConfig() {
    this.source = './server/';
    this.models = './common/models/';

    this.tsOutputPath = './dist/server/';
    this.modelsOutputPath = this.tsOutputPath + 'models/';
    this.allJavaScript = [this.tsOutputPath + '/**/*.js'];
    this.allTypeScript = this.source + '/**/*.ts';
  }

  return gulpConfig;
})();
module.exports = GulpConfig;
