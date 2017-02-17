import {injectable, inject} from 'inversify';
import {IPostal} from "firmament-yargs";
import {EtlBaseImpl} from "./etl-base-impl";
import {EtlStep} from "../interfaces/etl-step";
import {EtlBase} from "../interfaces/etl-base";
@injectable()
export class EtlStepImpl extends EtlBaseImpl implements EtlStep {

  constructor(@inject('IPostal') private postal: IPostal) {
    super();
  }

  writeToDb(cb: (err?: Error, etlBase?: EtlBase) => void) {
    let me = this;
    let s = me['status'];
    if (typeof cb !== 'function') {
      return;
    }
    cb();
  }

  set endTime(newProgress: Date) {
    this.loopbackModel.endTime = newProgress;
  }

  get endTime(): Date {
    return this.loopbackModel.endTime;
  }

  set currentTime(newProgress: Date) {
    this.loopbackModel.currentTime = newProgress;
  }

  get currentTime(): Date {
    return this.loopbackModel.currentTime;
  }

  set startTime(newProgress: Date) {
    this.loopbackModel.startTime = newProgress;
  }

  get startTime(): Date {
    return this.loopbackModel.startTime;
  }

  set progress(newProgress: number) {
    this.loopbackModel.progress = newProgress;
  }

  get progress(): number {
    return this.loopbackModel.progress;
  }

  set status(newStatus: string) {
    this.loopbackModel.status = newStatus;
  }

  get status(): string {
    return this.loopbackModel.status;
  }

  set parentFlowAminoId(newParentFlowAminoId: string) {
    this.loopbackModel.parentFlowAminoId = newParentFlowAminoId;
  }

  get parentFlowAminoId(): string {
    return this.loopbackModel.parentFlowAminoId;
  }
}
