import {injectable, inject} from 'inversify';
import {ServiceManager} from "../interfaces/service-manager";
import {CommandUtil} from "firmament-yargs";
import {BaseService} from "../interfaces/base-service";
import {InitializeDatabase} from "../interfaces/initialize-database";
import {FolderMonitor} from "../interfaces/folder-monitor";
import {DbMonitor} from "../interfaces/db-monitor";
import {Loopback} from "../interfaces/loopback";

const async = require('async');

@injectable()
export class ServiceManagerImpl implements ServiceManager {
  constructor(@inject('BaseService') private baseService: BaseService,
              @inject('CommandUtil') private commandUtil: CommandUtil,
              @inject('FolderMonitor') private folderMonitor: FolderMonitor,
              @inject('DbMonitor') private dbMonitor: DbMonitor,
              @inject('Loopback') private loopback: Loopback,
              @inject('InitializeDatabase') private initializeDatabase: InitializeDatabase) {
  }

  get server(): any {
    return this.baseService.server;
  }

  initSubscriptions(cb: (err: Error, result: any) => void) {
  }

  init(cb: (err: Error, result: any) => void) {
    async.series([
      cb => {
        let functionArray = [];
        functionArray.push(async.apply(this.initializeDatabase.initSubscriptions.bind(this.initializeDatabase)));
        functionArray.push(async.apply(this.folderMonitor.initSubscriptions.bind(this.folderMonitor)));
        functionArray.push(async.apply(this.dbMonitor.initSubscriptions.bind(this.dbMonitor)));
        functionArray.push(async.apply(this.loopback.initSubscriptions.bind(this.loopback)));
        async.parallel(functionArray, cb);
      },
      cb => {
        let functionArray = [];
        functionArray.push(async.apply(this.initializeDatabase.init.bind(this.initializeDatabase)));
        functionArray.push(async.apply(this.folderMonitor.init.bind(this.folderMonitor)));
        functionArray.push(async.apply(this.dbMonitor.init.bind(this.dbMonitor)));
        functionArray.push(async.apply(this.loopback.init.bind(this.loopback)));
        async.parallel(functionArray, cb);
      }
    ], cb);
  }
}
