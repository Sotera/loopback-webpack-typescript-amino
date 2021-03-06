import {injectable, inject} from 'inversify';
import {IPostal, CommandUtil} from "firmament-yargs";
import {EtlBaseImpl} from "./etl-base-impl";
import {EtlStep, EtlBase} from "../../../node_modules/etl-typings/index";
@injectable()
export class EtlStepImpl extends EtlBaseImpl implements EtlStep {
  constructor(@inject('CommandUtil') protected commandUtil: CommandUtil,
              @inject('IPostal') protected postal: IPostal) {
    super(commandUtil, postal);
  }

  getPojo(): any {
    let me = this;
    let retVal = super.getPojo();
    retVal.endTime = me.endTime;
    retVal.startTime = me.startTime;
    retVal.currentTime = me.currentTime;
    retVal.progress = me.progress;
    return retVal;
  }

  writeToDb(cb?: (err?: Error, etlBase?: EtlBase) => void) {
    super.writeToDb(cb);
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

  set index(newIndex: number) {
    this.setProperty<number>('index', newIndex);
  }

  get index(): number {
    return this.getProperty<number>('index');
  }
}
