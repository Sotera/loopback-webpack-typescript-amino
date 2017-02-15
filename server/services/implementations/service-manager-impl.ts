import {injectable, inject} from 'inversify';
import {ServiceManager} from "../interfaces/service-manager";
import {BaseService} from "../interfaces/base-service";
import {InitializeDatabase} from "../interfaces/initialize-database";
import {FolderMonitor} from "../interfaces/folder-monitor";
import {DbMonitor} from "../interfaces/db-monitor";
import {Loopback} from "../interfaces/loopback";

const async = require('async');

@injectable()
export class ServiceManagerImpl implements ServiceManager {
  constructor(@inject('BaseService') private baseService: BaseService,
              @inject('FolderMonitor') private folderMonitor: FolderMonitor,
              @inject('DbMonitor') private dbMonitor: DbMonitor,
              @inject('Loopback') private loopback: Loopback,
              @inject('InitializeDatabase') private initializeDatabase: InitializeDatabase) {
  }

  get server(): any {
    return this.baseService.server;
  }

  initSubscriptions(cb: (err: Error, result: any) => void) {
    cb(null, null);
  }

  init(cb: (err: Error, result: any) => void) {
    let fnArray = [
      this.initializeDatabase.initSubscriptions.bind(this.initializeDatabase),
      this.folderMonitor.initSubscriptions.bind(this.folderMonitor),
      this.dbMonitor.initSubscriptions.bind(this.dbMonitor),
      this.loopback.initSubscriptions.bind(this.loopback),
      this.initializeDatabase.init.bind(this.initializeDatabase),
      this.folderMonitor.init.bind(this.folderMonitor),
      this.dbMonitor.init.bind(this.dbMonitor),
      this.loopback.init.bind(this.loopback)
    ];
    async.mapSeries(fnArray,
      (fn, cb) => {
        fn(cb);
      }, cb);
  }
}
