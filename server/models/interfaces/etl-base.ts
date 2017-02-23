import {EtlError} from "./etl-error";
export interface EtlBase {
  id: string;
  aminoId: string;
  parentAminoId: string;
  name: string;
  loopbackModel: any;
  getPojo(): any;
  addErrors(errors: any[], cb: (err: Error, etlErrors: EtlError[]) => void): void;
  loadEntireObject(cb: (err: Error, etlBase: EtlBase) => void): void;
  writeToDb(cb?: (err?: Error, etlBase?: EtlBase) => void): void;
  removeFromDb(cb?: (err?: Error, etlBase?: EtlBase) => void): void;
}
