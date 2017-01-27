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
      name: 'Bro',
      steps: [
        {
          name: 'UnEncryptAndUnTar'
        },
        {
          name: 'UnZipAllPcaps'
        },
        {
          name: 'MergePcaps'
        }
      ]
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
    etlFlow.getDataSource().setMaxListeners(0);
    InitializeDatabaseImpl.etlFlows.forEach(flow => {
      etlFlow.findOrCreate({where: {name: flow.name}, include: ['steps']}, flow, (err, newFlow) => {
        if (me.commandUtil.callbackIfError(cb, err)) {
          return;
        }
        //Stringify & parse loopback object to get contained objects
        let dbFlow = JSON.parse(JSON.stringify(newFlow));
        let stepsToAdd = _.differenceWith(flow.steps, dbFlow.steps, (a, b) => {
          return a.name === b.name;
        });
        async.each(stepsToAdd, newFlow.steps.create, err => {
          if (me.commandUtil.callbackIfError(cb, err)) {
            return;
          }
          cb(null, {message:'Initialized database'});
        });
      });
    });
  }
}
