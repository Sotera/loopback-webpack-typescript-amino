import {EtlResource} from "./etl-resource";
export class EtlStep{
  id: string;
  name: string;
  start: string;
  end: string;
  result: string;
  command: string;
  index: number;
  sources: EtlResource[];
  products: EtlResource[];
}
