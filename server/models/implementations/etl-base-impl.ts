import {inject, injectable} from 'inversify';
import {IPostal} from "firmament-yargs";
import {EtlBase} from "../interfaces/etl-base";

@injectable()
export class EtlBaseImpl implements EtlBase {
  loopbackModel: any;

  constructor() {
  }

  loadEntireObject(cb: (err?: Error, etlBase?: EtlBase) => void): void {
    if (typeof cb !== 'function') {
      return;
    }
    cb();
  }

  get pojo(): any {
    return JSON.parse(JSON.stringify(this.loopbackModel));
  }

  get id(): string {
    return this.loopbackModel.id;
  }

  get aminoId(): string {
    return this.loopbackModel.aminoId;
  }

  set name(newName) {
    this.loopbackModel.name = newName;
  }

  get name(): string {
    return this.loopbackModel.name;
  }
}
