import {CommandUtil} from 'firmament-yargs';
import kernel from '../../server/inversify.config';
export class EtlBase {
  static server: any;
  private _isDirty: boolean;
  private typeScriptObject: any;
  private commandUtil = kernel.get<CommandUtil>('CommandUtil');

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
    return this.loopbackModelInstance.id;
  }

  set name(newName) {
    this.loopbackModelInstance.name = newName;
  }

  get name(): string {
    return this.loopbackModelInstance.name;
  }

  save(cb: (err: Error, model: any) => void = (() => {
  })) {
    let me = this;
    if (me.loopbackModelInstance) {
      me.loopbackModel.updateAttributes(me.loopbackModelInstance, cb);
    }
  }

  protected _createHasManyInstance(name, typeScriptObject, cb: (err, model) => void) {
    let me = this;
    me.loopbackModelInstance[name].create(typeScriptObject, (err, model) => {
      cb(err, model);
    });
  }

  protected _create(typeScriptObject, cb: (err, model) => void) {
    let me = this;
    me.loopbackModel.create(typeScriptObject, (err, model) => {
      if (me.commandUtil.callbackIfError(cb, err)) {
        return;
      }
      me.setModelAndModelInstance(model);
      cb(err, me);
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
