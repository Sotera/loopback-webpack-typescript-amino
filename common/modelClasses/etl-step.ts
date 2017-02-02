import {EtlResource} from "./etl-resource";
import {EtlBase} from "./etl-base";
export class EtlStep extends EtlBase {
  constructor(protected loopbackModelInstance: any = null) {
    super(EtlBase.server.models.EtlStep, {}, loopbackModelInstance);
  }

  set start(newStart) {
    this.loopbackModelInstance.start = newStart;
  }

  get start(): Date {
    return this.loopbackModelInstance.start;
  }

  set end(newEnd) {
    this.loopbackModelInstance.end = newEnd;
  }

  get end(): Date {
    return this.loopbackModelInstance.end;
  }

  set result(newResult) {
    this.loopbackModelInstance.result = newResult;
  }

  get result(): string {
    return this.loopbackModelInstance.result;
  }

  set command(newCommand) {
    this.loopbackModelInstance.command = newCommand;
  }

  get command(): string {
    return this.loopbackModelInstance.command;
  }

  sources: EtlResource[];
  products: EtlResource[];
}
