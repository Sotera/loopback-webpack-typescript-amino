import {EtlStep} from "./etl-step";
export class EtlFlow{
  id: string;
  name: string;
  steps: EtlStep[];
  lastStatus: string;
}
