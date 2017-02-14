import {injectable, inject} from 'inversify';
import {CommandUtil, IPostal} from 'firmament-yargs';
import {BaseService} from '../interfaces/base-service';
import {Loopback} from '../interfaces/loopback';
import kernel from '../../inversify.config';
import * as _ from 'lodash';
import {EtlBase} from '../../models/interfaces/etl-base';
import {
  ModelCreateOptions,
  CreateChangeStreamOptions,
  ModelFindOptions,
  ModelFindByIdOptions
} from '../../models/interfaces/loopback-control';
import {ModelFindOrCreateOptions} from '../../models/interfaces/loopback-control';
import {Guid} from '../../util/guid-gen';
import {ModelCreateHasManyObjectOptions} from '../../models/interfaces/loopback-control';
import {UpdateAttributesOptions} from "../../models/interfaces/loopback-control";
import {UpdateAttributeOptions} from "../../models/interfaces/loopback-control";
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
      topic: 'FindById',
      callback: me.loopbackFindById.bind(me)
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
        if (typeof updateAttributeOptions.callback !== 'function') {
          return;
        }
        let newWrapper = kernel.get<EtlBase>(updateAttributeOptions.className);
        newWrapper.loopbackModel = updatedInstance;
        updateAttributeOptions.callback(err, newWrapper);
      });
  }
  private loopbackUpdateAttributes(updateAttributesOptions: UpdateAttributesOptions) {
    updateAttributesOptions.loopbackModelToUpdate.updateAttributes(
      updateAttributesOptions.updatedAttributes,
      (err, updatedInstance) => {
        if (typeof updateAttributesOptions.callback !== 'function') {
          return;
        }
        let newWrapper = kernel.get<EtlBase>(updateAttributesOptions.className);
        newWrapper.loopbackModel = updatedInstance;
        updateAttributesOptions.callback(err, newWrapper);
      });
  }

  private createChangeStream(createChangeStreamOptions: CreateChangeStreamOptions) {
    let me = this;
    let cb = createChangeStreamOptions.collectionChangedCallback;
    if (typeof cb !== 'function') {
      return;
    }
    me.server.models[createChangeStreamOptions.className].createChangeStream((err, changes) => {
      changes.on('data', change => {
        cb(change);
      });
    });
  }

  private loopbackFindById(modelFindByIdOptions: ModelFindByIdOptions) {
    let me = this;
    if (typeof modelFindByIdOptions.callback !== 'function') {
      return;
    }
    me.server.models[modelFindByIdOptions.className].findById(
      modelFindByIdOptions.id,
      modelFindByIdOptions.filter || {},
      (err, model) => {
        let newWrapper = kernel.get<EtlBase>(modelFindByIdOptions.className);
        newWrapper.loopbackModel = model;
        modelFindByIdOptions.callback(err, newWrapper);
      });
  }

  private loopbackFind(modelFindOptions: ModelFindOptions) {
    let me = this;
    if (typeof modelFindOptions.callback !== 'function') {
      return;
    }
    me.server.models[modelFindOptions.className].find(modelFindOptions.filter || {},
      (err, models) => {
        let modelWrappers = [];
        models.forEach(model => {
          let newWrapper = kernel.get<EtlBase>(modelFindOptions.className);
          newWrapper.loopbackModel = model;
          modelWrappers.push(newWrapper);
        });
        modelFindOptions.callback(err, modelWrappers);
      }
    );
  }

  private loopbackFindOrCreate(modelFindOrCreateOptions: ModelFindOrCreateOptions) {
    let me = this;
    if (typeof modelFindOrCreateOptions.callback !== 'function') {
      return;
    }
    let initializationObject = modelFindOrCreateOptions.initializationObject || {};
    initializationObject.aminoId = Guid.generate();
    me.server.models[modelFindOrCreateOptions.className].findOrCreate(
      modelFindOrCreateOptions.filter || {},
      initializationObject,
      (err, model) => {
        let newWrapper = kernel.get<EtlBase>(modelFindOrCreateOptions.className);
        newWrapper.loopbackModel = model;
        modelFindOrCreateOptions.callback(err, newWrapper);
      });
  }

  private loopbackCreateHasManyObject(mCHMOO: ModelCreateHasManyObjectOptions) {
    let me = this;
    let fnArray = [];
    mCHMOO.containedObjects.forEach((containedObject: ModelCreateOptions) => {
      fnArray.push(async.apply(
        (containedObject: ModelCreateOptions, cb: (err: Error, createdObject: EtlBase) => void) => {
          containedObject.callback = cb;
          containedObject.initializationObject['parentFileAminoId'] = mCHMOO.containerObject.aminoId;
          me.postal.publish({
            channel: 'Loopback',
            topic: 'Create',
            data: containedObject
          });
        }, containedObject));
    });
    mCHMOO.callback = mCHMOO.callback || (() => {
      });
    async.parallel(fnArray, mCHMOO.callback);
  }

  private loopbackCreate(modelCreateOptions: ModelCreateOptions) {
    let me = this;
    let initializationObject = modelCreateOptions.initializationObject || {};
    initializationObject.aminoId = Guid.generate();
    initializationObject.name = initializationObject.name || Guid.generate();
    me.server.models[modelCreateOptions.className].create(
      initializationObject,
      (err, newModel) => {
        let newWrapper = kernel.get<EtlBase>(modelCreateOptions.className);
        newWrapper.loopbackModel = newModel;
        if (typeof modelCreateOptions.callback !== 'function') {
          return;
        }
        modelCreateOptions.callback(err, newWrapper);
      });
  }
}
