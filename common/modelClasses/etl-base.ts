import {CommandUtil} from 'firmament-yargs';
import kernel from '../../server/inversify.config';
const deepExtend = require('deep-extend');
export class EtlBase {
  static server: any;
  private _isDirty: boolean;
  private commandUtil = kernel.get<CommandUtil>('CommandUtil');
  typeScriptObject: any;

  constructor(private loopbackModel: any,
              private entireObjectFilter: any,
              protected loopbackModelInstance: any = null) {
    this._isDirty = true;
    this.typeScriptObject = loopbackModelInstance
      ? JSON.parse(JSON.stringify(loopbackModelInstance))
      : {};
  }

  get isDirty(): boolean {
    return this._isDirty;
  }

  get id(): string {
    return this.typeScriptObject.id;
  }

  set name(newName) {
    this.typeScriptObject.name = newName;
  }

  get name(): string {
    return this.typeScriptObject.name;
  }

  save(cb: (err: Error, model: any) => void = (() => {
  })) {
    let me = this;
    if (me.typeScriptObject) {
      me.loopbackModel.updateAttributes(me.typeScriptObject, cb);
    }
  }

  protected _createHasManyInstance(name, typeScriptObject, cb: (err, model) => void) {
    let me = this;
    me.loopbackModelInstance[name].create(typeScriptObject, (err, model) => {
      if (me.commandUtil.callbackIfError(cb, err)) {
        return;
      }
      me._findById(me.id, (err, me) => {
        cb(err, model);
      });
    });
  }

  protected _create(typeScriptObject, cb: (err, model) => void) {
    let me = this;
    me.loopbackModel.create(typeScriptObject, (err, model) => {
      if (me.commandUtil.callbackIfError(cb, err)) {
        return;
      }
      me._findById(model.id, (err, foundModel) => {
        cb(err, me);
      });
    });
  }

  protected _find(filter, cb: (err, models: any[]) => void) {
    let me = this;
    deepExtend(filter, me.entireObjectFilter);
    me.loopbackModel.find(filter, (err, models) => {
      cb(err, models);
    });
  }

  protected _createChangeStream(cb: (err, changes) => void) {
    let me = this;
    me.loopbackModel.createChangeStream(cb);
  }

  protected _destroyById(id, cb: (err) => void) {
    let me = this;
    me.loopbackModel.destroyById(id, err => {
      if (me.commandUtil.callbackIfError(cb, err)) {
        return;
      }
      cb(err);
    });
  }

  protected _findById(id, cb: (err, me) => void) {
    let me = this;
    me.loopbackModel.findById(id, me.entireObjectFilter, (err, model) => {
      if (me.commandUtil.callbackIfError(cb, err)) {
        return;
      }
      me.setModelAndModelInstance(model);
      cb(err, me);
    });
  }

  private setModelAndModelInstance(model) {
    let me = this;
    me.loopbackModelInstance = model;
    me.typeScriptObject = JSON.parse(JSON.stringify(model));
  }
}
