var chokidar = require('chokidar');
var config = require('../config.json');

module.exports = function (app) {
  var EtlFile = app.models.EtlFile;

  // Initialize watcher.
  var watcher = chokidar.watch(config.folderMonitorPath, {
    ignored: /[\/\\]\./,
    ignoreInitial: true,
    persistent: true
  });

  watcher.on('add', (path, stats) => {
    var fileName = path.split('\\').pop().split('/').pop();
    var filePath = path.substr(0,path.lastIndexOf("/")+1);
    var fileSize = stats.size.toString();
    var fileCreateDate = stats.birthtime.toString();

    var newFile = {
      "name": fileName,
      "path": filePath,
      "size": fileSize,
      "createDate": fileCreateDate
    };

    EtlFile.create(newFile, function (err, obj) {
      if (err || !obj) {
        return;
      }
      console.log('Created file:' + path);
    });
  });
};
