export interface EtlFlow {
  id: string;
  name: string;
  steps: EtlStep[];
  lastStatus: string;
}

export interface EtlStep {
  id: string;
  name: string;
  start: string;
  end: string;
  result: string;
  command: string;
  index: number;
  source: EtlResource;
  products: EtlResource[];
}

export interface EtlFile {
  id: string;
  name: string;
  path: string;
  size: number;
  createDate: string;
  flows: EtlFlow[];
  tasks: EtlTask[];
}

export interface EtlResource {
  id: string;
  path: string;
  type: string;
}

export interface EtlTask {
  fileId: string;
  flowId: string;
}
