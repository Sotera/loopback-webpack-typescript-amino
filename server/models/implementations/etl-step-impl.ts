import {injectable, inject} from 'inversify';
import {IPostal} from "firmament-yargs";
import {EtlBaseImpl} from "./etl-base-impl";
import {EtlStep} from "../interfaces/etl-step";
import {EtlBase} from "../interfaces/etl-base";
@injectable()
export class EtlStepImpl extends EtlBaseImpl implements EtlStep {
  constructor(@inject('IPostal') protected postal: IPostal) {
    super(postal);
  }

  set endTime(newEndTime: Date) {
    this.setProperty<Date>('endTime', newEndTime);
  }

  get endTime(): Date {
    return this.getProperty<Date>('endTime');
  }

  set currentTime(newCurrentTime: Date) {
    this.setProperty<Date>('currentTime', newCurrentTime);
  }

  get currentTime(): Date {
    return this.getProperty<Date>('currentTime');
  }

  set startTime(newStartTime: Date) {
    this.setProperty<Date>('startTime', newStartTime);
  }

  get startTime(): Date {
    return this.getProperty<Date>('startTime');
  }

  set progress(newProgress: number) {
    this.setProperty<number>('progress', newProgress);
  }

  get progress(): number {
    return this.getProperty<number>('progress');
  }

  set status(newStatus: string) {
    this.setProperty<string>('status', newStatus);
  }

  get status(): string {
    return this.getProperty<string>('status');
  }

  set parentFlowAminoId(newParentFlowAminoId: string) {
    this.setProperty<string>('parentFlowAminoId', newParentFlowAminoId);
  }

  get parentFlowAminoId(): string {
    return this.getProperty<string>('parentFlowAminoId');
  }
}
