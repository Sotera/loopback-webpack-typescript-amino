import {EtlFlow} from './etl-flow';
import {EtlTask} from "./etl-task";
import {EtlBase} from "./etl-base";
export class EtlFile extends EtlBase {
  flows: EtlFlow[];
  tasks: EtlTask[];

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
    this.loopbackModelInstance.size = newSize;
  }

  get size(): string {
    return this.loopbackModelInstance.size;
  }

  set path(newPath) {
    this.loopbackModelInstance.path = newPath;
  }

  get path(): string {
    return this.loopbackModelInstance.path;
  }

  set createDate(newCreateDate) {
    this.loopbackModelInstance.createDate = newCreateDate;
  }

  get createDate(): Date {
    return this.loopbackModelInstance.createDate;
  }

  createFlow(typeScriptObject, cb: (err, etlFlow: EtlFlow) => void) {
    let me = this;
    this._createHasManyInstance('flows', typeScriptObject, (err, etlFlow) => {
      me._findById(me.id, ()=>{
        cb(err, etlFlow);
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
