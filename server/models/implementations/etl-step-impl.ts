import {injectable, inject} from 'inversify';
import {IPostal} from "firmament-yargs";
import {EtlBaseImpl} from "./etl-base-impl";
import {EtlStep} from "../interfaces/etl-step";
@injectable()
export class EtlStepImpl extends EtlBaseImpl implements EtlStep {
  constructor(@inject('IPostal') private postal: IPostal) {
    super();
  }
}
