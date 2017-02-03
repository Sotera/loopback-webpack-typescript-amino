import {EtlFlow} from './etl-flow';
import {EtlBase} from "./etl-base";
import * as _ from 'lodash';
export class EtlFile extends EtlBase {

  constructor(protected loopbackModelInstance: any = null) {
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
    return this.typeScriptObject.flows;
  }

  createFlow(typeScriptObject, cb: (err, etlFlow: EtlFlow) => void) {
    let me = this;
    this._createHasManyInstance('flows', typeScriptObject, (err, etlFlow) => {
      me._findById(me.id, (err, foundFile) => {
        let foundFlow = _.find(foundFile.flows, (f: EtlFlow) => {
          return f.id === etlFlow.id.toString();
        });
        if (!foundFlow) {
          err = new Error('foundFlow not attached to etlFile. Or something worse.');
        }
        cb(err, new EtlFlow(etlFlow));
      });
    });
  }

  static create(typeScriptObject, cb: (err, etlFile: EtlFile) => void) {
    let newEtlFile = new EtlFile();
    newEtlFile._create(typeScriptObject, (err, etlFile: EtlFile) => {
      cb(err, etlFile);
    });
  }

  static findById(id, cb: (err, etlFile: EtlFile) => void) {
    let newEtlFile = new EtlFile();
    newEtlFile._findById(id, cb);
  }
}
