import {EtlFlow} from './etl-flow';
import {EtlTask} from "./etl-task";
export class EtlFile {
  id: string;
  name: string;
  path: string;
  size: number;
  createDate: string;
  flows: EtlFlow[];
  tasks: EtlTask[];
}
