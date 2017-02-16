import {EtlBase} from "./etl-base";
export interface EtlStep extends EtlBase {
  parentFlowAminoId: string;
  startTime: Date;
  currentTime: Date;
  endTime: Date;
  progress: number;
  status: string;
}
