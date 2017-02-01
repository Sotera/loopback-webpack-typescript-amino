import {EtlStep} from "./etl-step";
export class EtlFlow {
  id: string;
  etlFileId: string;
  name: string;
  expanded: boolean;
  steps: EtlStep[];
  lastStatus: string;
}
