import {unmanaged, injectable} from 'inversify';
import {IPostal, CommandUtil} from "firmament-yargs";
import {EtlBase} from "../interfaces/etl-base";
const async = require('async');

@injectable()
export class EtlBaseImpl implements EtlBase {
  protected updateObject = {};
  loopbackModel: any;

  constructor(@unmanaged() protected commandUtil: CommandUtil,
              @unmanaged() protected postal: IPostal) {
  }

  get loopbackClassName() {
    return this.constructor.name.replace(/Impl/, '');
  }

  removeFromDb(cb?: (err?: Error, etlBase?: EtlBase) => void) {
    let me = this;
    me.postal.publish({
      channel: 'Loopback',
      topic: 'DestroyById',
      data: {
        className: me.loopbackClassName,
        id: me.id,
        callback: cb
      }
    });
  }

  writeToDb(cb?: (err?: Error, etlBase?: EtlBase) => void) {
    let me = this;
    me.postal.publish({
      channel: 'Loopback',
      topic: 'UpdateAttributes',
      data: {
        className: me.loopbackClassName,
        loopbackModelToUpdate: me.loopbackModel,
        updatedAttributes: me.updateObject,
        callback: EtlBaseImpl.checkCallback(cb)
      }
    });
  }

  loadEntireObject(cb: (err?: Error, etlBase?: EtlBase) => void): void {
    EtlBaseImpl.checkCallback(cb)();
  }

  get pojo(): any {
    return JSON.parse(JSON.stringify(this.loopbackModel));
  }

  get id(): string {
    return this.loopbackModel.id;
  }

  get aminoId(): string {
    return this.loopbackModel.aminoId;
  }

  set name(newName: string) {
    this.setProperty<string>('name', newName);
  }

  get name(): string {
    return this.getProperty<string>('name');
  }

  protected setProperty<T>(propertyName: string, newPropertyValue: T) {
    if (this.loopbackModel[propertyName] === newPropertyValue) {
      return;
    }
    this.updateObject[propertyName] = newPropertyValue;
  }

  protected getProperty<T>(propertyName: string): T {
    return (this.updateObject.hasOwnProperty(propertyName))
      ? this.updateObject[propertyName]
      : this.loopbackModel[propertyName];
  }

  protected static executeOnCollections(etlBase: EtlBase,
                                        superMethod: ((cb: (err, etlBase) => void) => void),
                                        collectionName: string,
                                        methodName: string,
                                        cb: (err, etlBase: EtlBase) => void) {
    etlBase.loadEntireObject(() => {
      async.each(etlBase[collectionName],
        (etlBase: EtlBase, cb) => {
          etlBase[methodName](cb);
        },
        (err) => {
          superMethod.bind(etlBase)(EtlBaseImpl.checkCallback(cb));
        });
    });
  }

  protected static checkCallback(cb: any) {
    return (typeof cb === 'function') ? cb : (() => {
      });
  }
}
