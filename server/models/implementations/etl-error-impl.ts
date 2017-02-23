import {injectable, inject} from 'inversify';
import {IPostal, CommandUtil} from 'firmament-yargs';
import {EtlBaseImpl} from './etl-base-impl';
import {EtlError} from "../interfaces/etl-error";
const async = require('async');

@injectable()
export class EtlErrorImpl extends EtlBaseImpl implements EtlError {
  constructor(@inject('CommandUtil') protected commandUtil: CommandUtil,
              @inject('IPostal') protected postal: IPostal) {
    super(commandUtil, postal);
  }

  getPojo(): any {
    let me = this;
    let retVal = super.getPojo();
    retVal.message = me.message;
    return retVal;
  }

  set message(newMessage: string) {
    this.setProperty<string>('message', newMessage);
  }

  get message(): string {
    return this.getProperty<string>('message');
  }
}
