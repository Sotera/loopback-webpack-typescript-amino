import {EtlBase} from "./etl-base";
export interface EtlError extends EtlBase {
  message: string;
}
