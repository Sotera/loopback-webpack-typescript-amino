import {EtlFlow} from './etl-flow';
import {EtlBase} from "./etl-base";
import * as _ from 'lodash';
const async = require('async');
export class EtlFile extends EtlBase {
  private etlFlows: EtlFlow[];

  private constructor(protected loopbackModelInstance: any = null) {
    super(EtlBase.server.models.EtlFile, {
      include: {
        relation: 'flows',
        scope: {
          include: ['steps']
        }
      }
    }, loopbackModelInstance);
  }

  set size(newSize) {
    this.typeScriptObject.size = newSize;
  }

  get size(): string {
    return this.typeScriptObject.size;
  }

  set path(newPath) {
    this.typeScriptObject.path = newPath;
  }

  get path(): string {
    return this.typeScriptObject.path;
  }

  set createDate(newCreateDate) {
    this.typeScriptObject.createDate = newCreateDate;
  }

  get createDate(): Date {
    return this.typeScriptObject.createDate;
  }

  get flows(): EtlFlow[] {
    return this.etlFlows;
  }

  private loadEtlFlows(cb: (err, flows?) => void) {
    let me = this;
    let fnArray = [];
    me.typeScriptObject.flows.forEach(flow => {
      fnArray.push(async.apply((flow, cb) => {
        EtlFlow.findById(flow.id, (err, etlFlow) => {
          cb(err, etlFlow);
        });
      }, flow));
    });
    async.parallel(fnArray, (err, results) => {
      cb(err, me.etlFlows = results);
    });
  }

  createFlow(typeScriptObject, cb: (err, etlFlow: EtlFlow) => void) {
    let me = this;
    this._createHasManyInstance('flows', typeScriptObject, (err, etlFlow) => {
      me.loadEtlFlows(err => {
        let newEtlFlow = _.find(me.etlFlows, f => {
          return etlFlow.id.toString() === f.id;
        });
        cb(err, newEtlFlow);
      });
    });
  }

  static createFromLoopbackInstance(loopbackInstance, cb: (err, etlFile: EtlFile) => void) {
    let newEtlFile = new EtlFile(loopbackInstance);
    newEtlFile.loadEtlFlows(err => {
      cb(err, newEtlFile);
    });
  }

  static createFromTypeScriptObject(typeScriptObject, cb: (err, etlFile: EtlFile) => void) {
    let newEtlFile = new EtlFile();
    newEtlFile._create(typeScriptObject, (err, etlFile: EtlFile) => {
      etlFile.loadEtlFlows(err => {
        cb(err, etlFile);
      });
    });
  }

  static find(filter, cb: (err, etlFiles: EtlFile[]) => void) {
    let newEtlFile = new EtlFile();
    newEtlFile._find(filter, (err, models) => {
      let fnArray = [];
      models.forEach(model => {
        fnArray.push(async.apply((model, cb) => {
          let etlFile = new EtlFile(model);
          etlFile.loadEtlFlows(err => {
            cb(err, etlFile);
          });
        }, model));
      });
      async.parallel(fnArray, (err, results) => {
        cb(err, results);
      });
    });
  }

  static createChangeStream(cb: (err, changes) => void) {
    new EtlFile()._createChangeStream(cb);
  }

  static destroyById(id, cb: (err) => void) {
    new EtlFile()._destroyById(id, cb);
  }

  static findById(id, cb: (err, etlFile: EtlFile) => void) {
    new EtlFile()._findById(id, cb);
  }
}
