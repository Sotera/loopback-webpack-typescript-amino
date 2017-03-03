import {injectable, inject} from 'inversify';
import {CommandUtil, IPostal} from "firmament-yargs";
import {BaseService} from "../interfaces/base-service";
import {FolderMonitor} from "../interfaces/folder-monitor";
const path = require('path');
const fs = require('fs');

const chokidar = require('chokidar');
const config = require((<any>global).configFilePath);

//noinspection JSUnusedGlobalSymbols
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

  initSubscriptions(cb: (err: Error, result: any) => void) {
    cb(null, {message: 'Initialized folderMonitor Subscriptions'});
  }

  init(cb: (err: Error, result: any) => void) {
    let me = this;

    console.log(`config.folderMonitorPath: ${config.folderMonitorPath}`);

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

      me.postal.publish({
        channel: 'Loopback',
        topic: 'Create',
        data: {
          className: 'EtlFile',
          initializationObject: {name, path, size, createDate}
        }
      });
    });
    cb(null, {message: 'Initialized folderMonitor'});
  }
}
