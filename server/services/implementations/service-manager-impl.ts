import {injectable, inject} from 'inversify';
import {ServiceManager} from "../interfaces/service-manager";
import {CommandUtil} from "firmament-yargs";
import {BaseService} from "../interfaces/base-service";
import {InitializeDatabase} from "../interfaces/initialize-database";
import {FolderMonitor} from "../interfaces/folder-monitor";
import {DbMonitor} from "../interfaces/db-monitor";

const async = require('async');

@injectable()
export class ServiceManagerImpl implements ServiceManager {
  constructor(@inject('BaseService') private baseService: BaseService,
              @inject('CommandUtil') private commandUtil: CommandUtil,
              @inject('FolderMonitor') private folderMonitor: FolderMonitor,
              @inject('DbMonitor') private dbMonitor: DbMonitor,
              @inject('InitializeDatabase') private initializeDatabase: InitializeDatabase) {
  }

  get server(): any {
    return this.baseService.server;
  }

  init(cb: (err: Error, result: any) => void) {
    let functionArray = [];
    functionArray.push(async.apply(this.initializeDatabase.init.bind(this.initializeDatabase)));
    functionArray.push(async.apply(this.folderMonitor.init.bind(this.folderMonitor)));
    functionArray.push(async.apply(this.dbMonitor.init.bind(this.dbMonitor)));
    async.parallel(functionArray, (err, result) => {
      cb(err, result);
    });
  }
}
