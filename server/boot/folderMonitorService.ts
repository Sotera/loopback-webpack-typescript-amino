import kernel from '../inversify.config';
import {IPostal, IEnvelope} from 'firmament-yargs';
let chokidar = require('chokidar');
let config = require('../config.json');

module.exports = function (app) {
  let postal: IPostal = kernel.get<IPostal>('IPostal');
  let EtlFile = app.models.EtlFile;

  // Initialize watcher.
  let watcher = chokidar.watch(config.folderMonitorPath, {
    ignored: /[\/\\]\./,
    ignoreInitial: true,
    persistent: true
  });

  watcher.on('add', (path, stats) => {
    let fileName = path.split('\\').pop().split('/').pop();
    let filePath = path.substr(0, path.lastIndexOf("/") + 1);
    let fileSize = stats.size.toString();
    let fileCreateDate = stats.birthtime.toString();

    let newFile = {
      "name": fileName,
      "path": filePath,
      "size": fileSize,
      "createDate": fileCreateDate
    };

    EtlFile.create(newFile, function (err, obj) {
      if (err || !obj) {
        return;
      }
      postal.publish({
        channel: 'WebSocket',
        topic: 'Broadcast',
        data: {
          channel: 'EtlFile',
          topic: 'FileAdded',
          data: {newFile}
        }
      });
      console.log('Created file:' + path);
    });
  });
};
