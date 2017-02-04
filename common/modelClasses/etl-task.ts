import {EtlBase} from "./etl-base";
export class EtlTask extends EtlBase {
  private constructor(protected loopbackModelInstance: any = null) {
    super(EtlBase.server.models.EtlTask, {}, loopbackModelInstance);
  }

  set fileId(newFileId) {
    this.typeScriptObject.fileId = newFileId;
  }

  get fileId(): string {
    return this.typeScriptObject.fileId;
  }

  set flowId(newFileId) {
    this.typeScriptObject.flowId = newFileId;
  }

  get flowId(): string {
    return this.typeScriptObject.flowId;
  }

  static createChangeStream(cb: (err, changes) => void) {
    new EtlTask()._createChangeStream(cb);
  }

  static createFromTypeScriptObject(typeScriptObject, cb: (err, etlTask: EtlTask) => void) {
    let newEtlTask = new EtlTask();
    newEtlTask._create(typeScriptObject, (err, etlTask: EtlTask) => {
      cb(err, etlTask);
    });
  }
}
