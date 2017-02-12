import {EtlBase} from "./etl-base";
export interface EtlTask extends EtlBase {
  fileId:string;
  flowId:string;
}
