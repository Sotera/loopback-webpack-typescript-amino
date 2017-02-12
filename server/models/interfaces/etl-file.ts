import {EtlBase} from "./etl-base";
import {EtlFlow} from "./etl-flow";
export interface EtlFile extends EtlBase {
  path: string;
  size: number;
  createDate: Date;
  flows: EtlFlow[];
}
