import {injectable, inject} from 'inversify';
import {CommandUtil, IPostal} from "firmament-yargs";
import {BaseService} from "../interfaces/base-service";
import {FolderMonitor} from "../interfaces/folder-monitor";

const chokidar = require('chokidar');
const config = require('../../config.json');

@injectable()
export class FolderMonitorImpl implements FolderMonitor {

  constructor(@inject('BaseService') private baseService: BaseService,
              @inject('IPostal') private postal: IPostal,
              @inject('CommandUtil') private commandUtil: CommandUtil) {
    this.commandUtil.log('FolderMonitor created');
  }

  get server(): any {
    return this.baseService.server;
  }

  init(cb: (err: Error, result: any) => void) {
    let me = this;

    let watcher = chokidar.watch(config.folderMonitorPath, {
      ignored: /[\/\\]\./,
      ignoreInitial: true,
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    watcher.on('add', (fullPath, stats) => {
      let name = fullPath.split('\\').pop().split('/').pop();
      let path = fullPath.substr(0, fullPath.lastIndexOf("/") + 1);
      let size = stats.size.toString();
      let createDate = stats.birthtime.toString();

      let EtlFile = me.server.models.EtlFile;
      EtlFile.create({name, path, size, createDate}, function (err, newFile) {
        if (err) {
          me.commandUtil.error(err.message);
          return;
        }
        me.postal.publish({
          channel: 'WebSocket',
          topic: 'Broadcast',
          data: {
            channel: 'EtlFile',
            topic: 'FileAdded',
            data: {newFile}
          }
        });
      });
    });
    cb(null, null);
  }
}
