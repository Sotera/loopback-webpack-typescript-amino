export class EtlFlow {
  constructor(public json: string) {
    var etlFlow = JSON.parse(json);
    this.id = etlFlow.id;
    this.name = etlFlow.name;
    this.steps = etlFlow.steps;
    this.lastStatus = etlFlow.lastStatus;
  }
  public id: string;
  public name: string;
  public steps: EtlStep[];

  public lastStatus: string;
}

export class EtlStep {
  constructor(public json: string) {
    var etlStep = JSON.parse(json);
    this.id = etlStep.id;
    this.name = etlStep.name;
    this.start = etlStep.start;
    this.end = etlStep.end;
    this.result = etlStep.result;
    this.index = etlStep.index;
    this.source = etlStep.source;
    this.products = etlStep.products;

  }
  public id: string;
  public name: string;
  public start: string;
  public end: string;
  public result: string;
  public index: number;
  public source: EtlResource;
  public products: EtlResource[];
}

export class EtlFile {
  constructor(public json: string) {
    var etlFile = JSON.parse(json);
    this.id = etlFile.id;
    this.name = etlFile.name;
    this.path = etlFile.path;
    this.size = etlFile.size;
    this.createDate = etlFile.createDate;
    this.flows = etlFile.flows;
    this.tasks = etlFile.tasks;

  }
  public id: string;
  public name: string;
  public path: string;
  public size: number;
  public createDate: string;
  public flows: EtlFlow[];
  public tasks: EtlTask[];
}

export class EtlResource {
  constructor(public json: string) {
    var etlSource = JSON.parse(json);
    this.id = etlSource.id;
    this.path = etlSource.path;
    this.type = etlSource.type;

  }
  public id: string;
  public path: string;
  public type: string;
}

export class EtlTask {
  constructor(public json: string) {
    var etlTask = JSON.parse(json);
    this.fileId = etlTask.fileId;
    this.flowId = etlTask.flowId;
  }
  public fileId: string;
  public flowId: string;
}
