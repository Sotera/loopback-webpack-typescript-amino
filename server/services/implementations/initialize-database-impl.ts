import {injectable, inject} from 'inversify';
import {InitializeDatabase} from "../interfaces/initialize-database";
import {CommandUtil} from "firmament-yargs";
import {BaseService} from "../interfaces/base-service";

const async = require('async');

@injectable()
export class InitializeDatabaseImpl implements InitializeDatabase {
  static defaultFlows = [
    {
      id: '586bcc5695e16687155b4a52',
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
    let etlFlow = this.baseService.server.models.EtlFlow;
    etlFlow.getDataSource().setMaxListeners(0);
    this.createFlows(InitializeDatabaseImpl.defaultFlows, etlFlow, cb);
  }

  private createFlows(flows, etlFlow, cb) {
    let me = this;
    let functionArray = [];
    flows.forEach(flow => {
      functionArray.push(async.apply(this.findOrCreateObject.bind(me), etlFlow, {where: {name: flow.name}}, flow));
    });
    async.parallel(functionArray, cb);
  }

  private findOrCreateObject(model, query, objToCreate, cb) {
    try {
      model.findOrCreate(query, objToCreate, cb);
    } catch (err) {
      this.commandUtil.callbackIfError(cb, err);
    }
  }
}
