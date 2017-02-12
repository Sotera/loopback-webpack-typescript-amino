export interface CreateChangeStreamOptions {
  className: string;
  collectionChangedCallback: (change: any) => void;
}
export interface ModelCreateOptions {
  className: string;
  initializationObject: any;
  callback: (err: Error, createdModel: any) => void;
}

export interface ModelFindOptions {
  className: string;
  filter: any;
  callback: (err: Error, foundModels: any[]) => void;
}

export interface ModelFindOrCreateOptions {
  className: string;
  filter: any;
  initializationObject: any;
  callback: (err: Error, foundModel: any) => void;
}

export interface ModelFindByIdOptions {
  className: string;
  id: string;
  filter: any;
  callback: (err: Error, foundModel: any) => void;
}
