import {injectable, inject} from 'inversify';
import {CommandUtil} from "firmament-yargs";
import {BaseService} from "../interfaces/base-service";
import {FolderMonitor} from "../interfaces/folder-monitor";
import {EtlFile} from "../../../common/modelClasses/etl-file";

const chokidar = require('chokidar');
const config = require('../../config.json');

//noinspection JSUnusedGlobalSymbols
@injectable()
export class FolderMonitorImpl implements FolderMonitor {

  constructor(@inject('BaseService') private baseService: BaseService,
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

      EtlFile.create({name, path, size, createDate}, (err) => {
        me.commandUtil.logError(err);
      });
    });
    cb(null, {message:'Initialized folder monitor'});
  }
}
