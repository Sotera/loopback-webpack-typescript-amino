import {injectable, inject} from 'inversify';
import {CommandUtil, IPostal} from 'firmament-yargs';
import {BaseService} from '../interfaces/base-service';
import {Loopback} from '../interfaces/loopback';
import kernel from '../../inversify.config';
import {
  ModelCreateOptions,
  CreateChangeStreamOptions,
  ModelFindOptions,
  ModelFindByIdOptions
} from '../../models/interfaces/loopback-control';
import {ModelFindOrCreateOptions} from '../../models/interfaces/loopback-control';
import {ModelCreateHasManyObjectOptions} from '../../models/interfaces/loopback-control';
import {UpdateAttributesOptions} from "../../models/interfaces/loopback-control";
import {UpdateAttributeOptions} from "../../models/interfaces/loopback-control";
import {ModelDestroyByIdOptions} from "../../models/interfaces/loopback-control";
import {ModelFindByAminoIdOptions} from "../../models/interfaces/loopback-control";
import {Util} from "../../util/util";
import {EtlBase} from "../../../node_modules/etl-typings/index";
const async = require('async');

@injectable()
export class LoopbackImpl implements Loopback {
  constructor(@inject('BaseService') private baseService: BaseService,
              @inject('IPostal') private postal: IPostal,
              @inject('CommandUtil') private commandUtil: CommandUtil) {
    this.commandUtil.log('LoopbackImpl created');
  }

  get server(): any {
    return this.baseService.server;
  }

  init(cb: (err: Error, result: any) => void) {
    cb(null, {message: 'Initialized Loopback'});
  }

  initSubscriptions(cb: (err: Error, result: any) => void) {
    let me = this;
    me.postal.subscribe({
      channel: 'Loopback',
      topic: 'CreateChangeStream',
      callback: me.createChangeStream.bind(me)
    });
    me.postal.subscribe({
      channel: 'Loopback',
      topic: 'CreateHasManyObject',
      callback: me.loopbackCreateHasManyObject.bind(me)
    });
    me.postal.subscribe({
      channel: 'Loopback',
      topic: 'Create',
      callback: me.loopbackCreate.bind(me)
    });
    me.postal.subscribe({
      channel: 'Loopback',
      topic: 'FindOrCreate',
      callback: me.loopbackFindOrCreate.bind(me)
    });
    me.postal.subscribe({
      channel: 'Loopback',
      topic: 'Find',
      callback: me.loopbackFind.bind(me)
    });
    me.postal.subscribe({
      channel: 'Loopback',
      topic: 'FindByAminoId',
      callback: me.loopbackFindByAminoId.bind(me)
    });
    me.postal.subscribe({
      channel: 'Loopback',
      topic: 'FindById',
      callback: me.loopbackFindById.bind(me)
    });
    me.postal.subscribe({
      channel: 'Loopback',
      topic: 'DestroyById',
      callback: me.loopbackDestroyById.bind(me)
    });
    me.postal.subscribe({
      channel: 'Loopback',
      topic: 'UpdateAttribute',
      callback: me.loopbackUpdateAttribute.bind(me)
    });
    me.postal.subscribe({
      channel: 'Loopback',
      topic: 'UpdateAttributes',
      callback: me.loopbackUpdateAttributes.bind(me)
    });
    cb(null, {message: 'Initialized Loopback Subscriptions'});
  }

  private loopbackUpdateAttribute(updateAttributeOptions: UpdateAttributeOptions) {
    updateAttributeOptions.loopbackModelToUpdate.updateAttribute(
      updateAttributeOptions.attributeName,
      updateAttributeOptions.newAttributeValue,
      (err, updatedInstance) => {
        let newWrapper = kernel.get<EtlBase>(updateAttributeOptions.className);
        newWrapper.loopbackModel = updatedInstance;
        Util.checkCallback(updateAttributeOptions.callback)(err, newWrapper);
      });
  }

  private loopbackUpdateAttributes(updateAttributesOptions: UpdateAttributesOptions) {
    updateAttributesOptions.loopbackModelToUpdate.updateAttributes(
      updateAttributesOptions.updatedAttributes,
      (err, updatedInstance) => {
        let newWrapper = kernel.get<EtlBase>(updateAttributesOptions.className);
        newWrapper.loopbackModel = updatedInstance;
        Util.checkCallback(updateAttributesOptions.callback)(err, newWrapper);
      });
  }

  private createChangeStream(createChangeStreamOptions: CreateChangeStreamOptions) {
    this.server.models[createChangeStreamOptions.className].createChangeStream((err, changes) => {
      changes.on('data', Util.checkCallback(createChangeStreamOptions.collectionChangedCallback));
    });
  }

  private loopbackDestroyById(modelDestroyByIdOptions: ModelDestroyByIdOptions) {
    let me = this;
    me.server.models[modelDestroyByIdOptions.className].destroyById(
      modelDestroyByIdOptions.id,
      (err) => {
        Util.checkCallback(modelDestroyByIdOptions.callback)(err);
      });
  }

  private loopbackFindByAminoId(modelFindByAminoIdOptions: ModelFindByAminoIdOptions) {
    this.loopbackFind({
      className: modelFindByAminoIdOptions.className,
      filter: {where: {aminoId: modelFindByAminoIdOptions.aminoId}},
      callback: (err, foundModels: EtlBase[]) => {
        let foundModel = (foundModels && foundModels.length === 1)
          ? foundModels[0]
          : null;
        Util.checkCallback(modelFindByAminoIdOptions.callback)(err, foundModel);
      }
    });
  }

  private loopbackFindById(modelFindByIdOptions: ModelFindByIdOptions) {
    let me = this;
    me.server.models[modelFindByIdOptions.className].findById(
      modelFindByIdOptions.id,
      modelFindByIdOptions.filter || {},
      (err, model) => {
        let newWrapper = kernel.get<EtlBase>(modelFindByIdOptions.className);
        newWrapper.loopbackModel = model;
        Util.checkCallback(modelFindByIdOptions.callback)(err, newWrapper);
      });
  }

  private loopbackFind(modelFindOptions: ModelFindOptions) {
    let me = this;
    me.server.models[modelFindOptions.className].find(modelFindOptions.filter || {},
      (err, models) => {
        let modelWrappers = [];
        models.forEach(model => {
          let newWrapper = kernel.get<EtlBase>(modelFindOptions.className);
          newWrapper.loopbackModel = model;
          modelWrappers.push(newWrapper);
        });
        Util.checkCallback(modelFindOptions.callback)(err, modelWrappers);
      }
    );
  }

  private loopbackFindOrCreate(modelFindOrCreateOptions: ModelFindOrCreateOptions) {
    let me = this;
    let initializationObject = modelFindOrCreateOptions.initializationObject || {};
    initializationObject.aminoId = Util.generateUUID();
    me.server.models[modelFindOrCreateOptions.className].findOrCreate(
      modelFindOrCreateOptions.filter || {},
      initializationObject,
      (err, model) => {
        let newWrapper = kernel.get<EtlBase>(modelFindOrCreateOptions.className);
        newWrapper.loopbackModel = model;
        Util.checkCallback(modelFindOrCreateOptions.callback)(err, newWrapper);
      });
  }

  private loopbackCreateHasManyObject(mCHMOO: ModelCreateHasManyObjectOptions) {
    let me = this;
    async.map(mCHMOO.containedObjects,
      (modelCreateOptions: ModelCreateOptions, cb) => {
        modelCreateOptions.callback = cb;
        modelCreateOptions.initializationObject[mCHMOO.parentPropertyName] = mCHMOO.containerObject.aminoId;
        me.postal.publish({
          channel: 'Loopback',
          topic: 'Create',
          data: modelCreateOptions
        });
      }, Util.checkCallback(mCHMOO.callback));
  }

  private loopbackCreate(modelCreateOptions: ModelCreateOptions) {
    let me = this;
    let initializationObject = modelCreateOptions.initializationObject || {};
    initializationObject.aminoId = Util.generateUUID();
    initializationObject.name = initializationObject.name || Util.generateUUID();
    me.server.models[modelCreateOptions.className].create(
      initializationObject,
      (err, newModel) => {
        let newWrapper = kernel.get<EtlBase>(modelCreateOptions.className);
        newWrapper.loopbackModel = newModel;
        Util.checkCallback(modelCreateOptions.callback)(err, newWrapper);
      });
  }
}
