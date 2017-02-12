import {injectable, inject} from 'inversify';
import {IPostal} from "firmament-yargs";
import {EtlBaseImpl} from "./etl-base-impl";
import {EtlFlow} from "../interfaces/etl-flow";
@injectable()
export class EtlFlowImpl extends EtlBaseImpl implements EtlFlow {
  constructor(@inject('IPostal') private postal: IPostal) {
    super();
  }
}
