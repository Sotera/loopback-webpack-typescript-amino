import {EtlResource} from "./etl-resource";
export class EtlStep {
  etlStepObject: any;

  constructor(private etlStepModel: any = null) {
    this.etlStepObject = etlStepModel
      ? JSON.parse(JSON.stringify(etlStepModel))
      : {};
  }

  save(cb: (err: Error, model: any) => void = (() => {
  })) {
    let me = this;
    if (me.etlStepModel) {
      me.etlStepModel.updateAttributes(me.etlStepObject, cb);
    }
  }

  get id(): string {
    return this.etlStepObject.id;
  }

  set name(newName) {
    this.etlStepObject.name = newName;
  }

  get name(): string {
    return this.etlStepObject.name;
  }

  set start(newStart) {
    this.etlStepObject.start = newStart;
  }

  get start(): Date {
    return this.etlStepObject.start;
  }

  set end(newEnd) {
    this.etlStepObject.end = newEnd;
  }

  get end(): Date {
    return this.etlStepObject.end;
  }

  set result(newResult) {
    this.etlStepObject.result = newResult;
  }

  get result(): string {
    return this.etlStepObject.result;
  }

  set command(newCommand) {
    this.etlStepObject.command = newCommand;
  }

  get command(): string {
    return this.etlStepObject.command;
  }

  /*  id: string;
   name: string;
   start: Date;
   end: Date;
   result: string;
   command: string;
   index: number;*/
  sources: EtlResource[];
  products: EtlResource[];
}
