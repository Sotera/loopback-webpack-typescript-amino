import {injectable, inject} from 'inversify';
import {InitializeDatabase} from '../interfaces/initialize-database';
import {CommandUtil, IPostal} from 'firmament-yargs';
import {BaseService} from '../interfaces/base-service';
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
        },
        {
          name: 'UnZip'
        },
        {
          name: 'MergePCap'
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
        },
        {
          name: 'WorkAWhiddle'
        },
        {
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
    async.map(InitializeDatabaseImpl.templateFlows,
      (templateFlow, cb) => {
        me.postal.publish({
          channel: 'Loopback',
          topic: 'FindOrCreate',
          data: {
            className: 'EtlFlow',
            filter: templateFlow.filter,
            initializationObject: {
              name: templateFlow.name,
              type: templateFlow.type
            },
            callback: (err, etlFlow) => {
              cb(err, {etlFlow, templateFlow});
            }
          }
        });
      },
      (err, results) => {
        async.map(results,
          ({etlFlow, templateFlow}, cb) => {
            async.map(templateFlow.steps,
              (step, cb) => {
                let parentFlowAminoId = etlFlow.aminoId;
                me.postal.publish({
                  channel: 'Loopback',
                  topic: 'FindOrCreate',
                  data: {
                    className: 'EtlStep',
                    filter: {where: {and: [{name: step.name}, {parentFlowAminoId}]}},
                    initializationObject: {
                      name: step.name,
                      parentFlowAminoId
                    },
                    callback: (err, etlStep) => {
                      cb(err, etlStep);
                    }
                  }
                });
              }, cb);
          },
          (err/*, results*/) => {
            cb(err, {message: 'Initialized initializeDatabase'});
          });
      });
  }
}
