import {EtlBase} from "../../../node_modules/etl-typings/index";
export interface CreateChangeStreamOptions {
  className: string;
  collectionChangedCallback: (change: any) => void;
}

export interface ModelCreateOptions {
  className: string;
  initializationObject: any;
  callback: (err: Error, createdModel: EtlBase) => void;
}

export interface ModelCreateHasManyObjectOptions {
  containerObject: EtlBase;
  parentPropertyName:string;
  containedObjects: ModelCreateOptions[],
  callback: (err: Error, createdModels: EtlBase[]) => void;
}

export interface ModelFindOptions {
  className: string;
  filter: any;
  callback: (err: Error, foundModels: EtlBase[]) => void;
}

export interface ModelFindOrCreateOptions {
  className: string;
  filter: any;
  initializationObject: any;
  callback: (err: Error, foundModel: EtlBase) => void;
}

export interface ModelDestroyByIdOptions {
  className: string;
  id: string;
  callback: (err: Error) => void;
}

export interface ModelFindByAminoIdOptions {
  className: string;
  aminoId: string;
  callback: (err: Error, foundModel: EtlBase) => void;
}

export interface ModelFindByIdOptions {
  className: string;
  id: string;
  filter: any;
  callback: (err: Error, foundModel: EtlBase) => void;
}

export interface UpdateAttributesOptions {
  className: string;
  loopbackModelToUpdate: any;
  updatedAttributes: any;
  callback: (err: Error, updatedModel: EtlBase) => void;
}

export interface UpdateAttributeOptions {
  className: string;
  loopbackModelToUpdate: any;
  attributeName: string;
  newAttributeValue: any;
  callback: (err: Error, updatedModel: EtlBase) => void;
}
