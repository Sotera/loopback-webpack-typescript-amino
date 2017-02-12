import {injectable, inject} from 'inversify';
import {InitializeDatabase} from '../interfaces/initialize-database';
import {CommandUtil, IPostal} from 'firmament-yargs';
import {BaseService} from '../interfaces/base-service';
import * as _ from 'lodash';
import {EtlFlow} from "../../models/interfaces/etl-flow";
import {EtlStep} from "../../models/interfaces/etl-step";
const async = require('async');

@injectable()
export class InitializeDatabaseImpl implements InitializeDatabase {
  static templateFlows = [
    {
      name: 'Bro',
      type: 'template',
      filter: {where: {and: [{name: 'Bro'}, {type: 'template'}]}},
      steps: [
        {
          name: 'DecryptAndUnTar',
        }
        ,
        {
          name: 'UnZip'
        },
        {
          name: 'MergePcap'
        }
      ]
    },
    {
      name: 'Bring',
      type: 'template',
      filter: {where: {and: [{name: 'Bring'}, {type: 'template'}]}},
      steps: [
        {
          name: 'LuvAMuffin'
        }
        , {
          name: 'WorkAWhiddle'
        }
        , {
          name: 'SavABaloonHead'
        }
      ]
    }
  ];

  constructor(@inject('BaseService') private baseService: BaseService,
              @inject('IPostal') private postal: IPostal,
              @inject('CommandUtil') private commandUtil: CommandUtil) {
    this.commandUtil.log('InitializeDatabase created');
  }

  get server(): any {
    return this.baseService.server;
  }

  initSubscriptions(cb: (err: Error, result: any) => void) {
    cb(null, {message: 'Initialized initializeDatabase Subscriptions'});
  }

  init(cb: (err: Error, result: any) => void) {
    let me = this;
    let fnArray = [];
    InitializeDatabaseImpl.templateFlows.forEach(templateFlow => {
      fnArray.push(async.apply(
        (flow, cb: (err: Error, result: any) => void) => {
          me.postal.publish({
            channel: 'Loopback',
            topic: 'FindOrCreate',
            data: {
              className: 'EtlFlow',
              filter: flow.filter,
              initializationObject: {
                name: flow.name,
                type: flow.type
              },
              callback: (err, etlFlow) => {
                cb(err, {etlFlow, templateFlow});
              }
            }
          });
        }, templateFlow)
      );
    });
    async.parallel(fnArray, (err, results: any[]) => {
      if (me.commandUtil.callbackIfError(cb, err)) {
        return;
      }
      let fnArray = [];
      results.forEach(({etlFlow, templateFlow}) => {
        templateFlow.steps.forEach(step => {
          fnArray.push(async.apply(
            (flow, cb: (err: Error, etlStep: EtlStep) => void) => {
              let parentFlowId = etlFlow.aminoId;
              me.postal.publish({
                channel: 'Loopback',
                //topic: 'Find',
                topic: 'FindOrCreate',
                data: {
                  className: 'EtlStep',
                  filter: {where: {and: [{name: step.name}, {parentFlowId}]}},
                  initializationObject: {
                    name: step.name,
                    parentFlowId
                  },
                  callback: (err, etlStep) => {
                    cb(err, etlStep);
                  }
                }
              });
            }, templateFlow)
          );
        });
      });
      async.parallel(fnArray, (err, results: any[]) => {
        if (me.commandUtil.callbackIfError(cb, err)) {
          return;
        }
        cb(null, {message: 'Initialized initializeDatabase'});
      });
    });
  }
}
