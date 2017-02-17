export interface EtlBase {
  id: string;
  aminoId: string;
  name: string;
  loopbackModel: any;
  pojo: any;
  loadEntireObject(cb: (err: Error, etlBase: EtlBase) => void): void;
  writeToDb(cb: (err: Error, etlBase: EtlBase) => void): void;
}
