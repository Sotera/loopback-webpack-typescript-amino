import {injectable, inject} from 'inversify';
import {InitializeDatabase} from '../interfaces/initialize-database';
import {CommandUtil} from 'firmament-yargs';
import {BaseService} from '../interfaces/base-service';
import * as _ from 'lodash';
const async = require('async');

@injectable()
export class InitializeDatabaseImpl implements InitializeDatabase {
  static etlFlows = [
    {
      name: 'Bro'
    }
  ];

  constructor(@inject('BaseService') private baseService: BaseService,
              @inject('CommandUtil') private commandUtil: CommandUtil) {
    this.commandUtil.log('InitializeDatabase created');
  }

  get server(): any {
    return this.baseService.server;
  }

  init(cb: (err: Error, result: any) => void) {
    let me = this;
    let etlFlow = this.baseService.server.models.EtlFlow;
    let etlStep = this.baseService.server.models.EtlStep;
    etlFlow.getDataSource().setMaxListeners(0);
    let fnArray = [];
    InitializeDatabaseImpl.etlFlows.forEach(flow => {
      fnArray.push(async.apply(etlFlow.findOrCreate.bind(etlFlow), {where: {name: flow.name}}, flow));
    });
    async.parallel(fnArray, err => {
      if (me.commandUtil.callbackIfError(cb, err)) {
        return;
      }
      cb(null, {message: 'Initialized database'});
    });
  }
}
