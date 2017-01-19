import {injectable, inject} from 'inversify';
import {ServiceManager} from "../interfaces/service-manager";
import {CommandUtil} from "firmament-yargs";
import {BaseService} from "../interfaces/base-service";
import {InitializeDatabase} from "../interfaces/initialize-database";

const async = require('async');

@injectable()
export class ServiceManagerImpl implements ServiceManager {
  constructor(@inject('BaseService') private baseService: BaseService,
              @inject('CommandUtil') private commandUtil: CommandUtil,
              @inject('InitializeDatabase') private initializeDatabase: InitializeDatabase) {
  }

  get server(): any {
    return this.baseService.server;
  }

  init(cb: (err: Error, result: any) => void) {
    let functionArray = [];
    functionArray.push(async.apply(this.initializeDatabase.init.bind(this.initializeDatabase)));
    async.parallel(functionArray, (err, result) => {
      cb(err, result);
    });
  }
}
