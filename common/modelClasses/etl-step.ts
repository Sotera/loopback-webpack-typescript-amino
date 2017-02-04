import {EtlResource} from "./etl-resource";
import {EtlBase} from "./etl-base";
export class EtlStep extends EtlBase {
  sources: EtlResource[];
  products: EtlResource[];

  private constructor(protected loopbackModelInstance: any = null) {
    super(EtlBase.server.models.EtlStep, {}, loopbackModelInstance);
  }

  set start(newStart) {
    this.typeScriptObject.start = newStart;
  }

  get start(): Date {
    return this.typeScriptObject.start;
  }

  set end(newEnd) {
    this.typeScriptObject.end = newEnd;
  }

  get end(): Date {
    return this.typeScriptObject.end;
  }

  set result(newResult) {
    this.typeScriptObject.result = newResult;
  }

  get result(): string {
    return this.typeScriptObject.result;
  }

  set command(newCommand) {
    this.typeScriptObject.command = newCommand;
  }

  get command(): string {
    return this.typeScriptObject.command;
  }

  static createChangeStream(cb: (err, changes) => void) {
    new EtlStep()._createChangeStream(cb);
  }

  static findById(id, cb: (err, etlStep: EtlStep) => void) {
    new EtlStep()._findById(id, cb);
  }
}
