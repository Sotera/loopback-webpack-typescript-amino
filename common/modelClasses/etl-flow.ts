import {EtlStep} from "./etl-step";
import {EtlBase} from "./etl-base";
export class EtlFlow extends EtlBase {
  etlFileId: string;
  expanded: boolean;
  steps: EtlStep[];
  lastStatus: string;

  constructor(protected loopbackModelInstance: any = null) {
    super(EtlBase.server.models.EtlFlow, {include: ['steps']}, loopbackModelInstance);
  }
}
