import {injectable, inject} from 'inversify';
import {IPostal} from "firmament-yargs";
import {EtlBaseImpl} from "./etl-base-impl";
import {EtlTask} from "../interfaces/etl-task";
@injectable()
export class EtlTaskImpl extends EtlBaseImpl implements EtlTask {
  constructor(@inject('IPostal') private postal: IPostal) {
    super();
  }

  get fileId():string{
    return this.loopbackModel.fileId;
  }

  get flowId():string{
    return this.loopbackModel.flowId;
  }
}
