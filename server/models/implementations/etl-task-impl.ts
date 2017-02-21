import {injectable, inject} from 'inversify';
import {IPostal} from "firmament-yargs";
import {EtlBaseImpl} from "./etl-base-impl";
import {EtlTask} from "../interfaces/etl-task";
@injectable()
export class EtlTaskImpl extends EtlBaseImpl implements EtlTask {
  constructor(@inject('IPostal') protected postal: IPostal) {
    super(postal);
  }

  get fileId(): string {
    return this.getProperty<string>('fileId');
  }

  get flowId(): string {
    return this.getProperty<string>('flowId');
  }
}
