import {injectable, inject} from 'inversify';
import {IPostal} from "firmament-yargs";
import {EtlFile} from "../interfaces/etl-file";
import {EtlBaseImpl} from "./etl-base-impl";
import {EtlFlow} from "../interfaces/etl-flow";
@injectable()
export class EtlFileImpl extends EtlBaseImpl implements EtlFile {
  constructor(@inject('IPostal') private postal: IPostal) {
    super();
  }

  get pojo(): any {
    let retVal = super.pojo;
    retVal.flows = this.flows;
    return retVal;
  }

  set size(newSize) {
    this.loopbackModel.size = newSize;
  }

  get flows(): EtlFlow[] {
    return [];
  }

  get size(): number {
    return this.loopbackModel.size;
  }

  set path(newPath) {
    this.loopbackModel.path = newPath;
  }

  get path(): string {
    return this.loopbackModel.path;
  }

  set createDate(newCreateDate) {
    this.loopbackModel.createDate = newCreateDate;
  }

  get createDate(): Date {
    return this.loopbackModel.createDate;
  }
}
