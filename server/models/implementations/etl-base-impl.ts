import {unmanaged, injectable} from 'inversify';
import {IPostal, CommandUtil} from "firmament-yargs";
import {EtlBase} from "../interfaces/etl-base";
import {Util} from "../../util/util";
import {EtlError} from "../interfaces/etl-error";
const async = require('async');

@injectable()
export class EtlBaseImpl implements EtlBase {
  protected updateObject = {};
  private _errors: EtlError[];
  loopbackModel: any;

  constructor(@unmanaged() protected commandUtil: CommandUtil,
              @unmanaged() protected postal: IPostal) {
  }

  get loopbackClassName() {
    return this.constructor.name.replace(/Impl/, '');
  }

  loadEntireObject(cb: (err?: Error, etlBase?: EtlBase) => void): void {
    let me = this;
    me.postal.publish({
      channel: 'Loopback',
      topic: 'Find',
      data: {
        className: 'EtlError',
        filter: {where: {parentAminoId: me.aminoId}},
        callback: (err, etlErrors: EtlError[]) => {
          me._errors = etlErrors;
          Util.checkCallback(cb)(err, me);
        }
      }
    });
  }

  addErrors(errors: any[], cb: (err: Error, etlErrors: EtlError[]) => void): void {
    let me = this;
    async.map(errors, (error, cb) => {
      cb(null, {
        className: 'EtlError',
        initializationObject: {
          message: error.message
        }
      });
    }, (err, containedObjects) => {
      me.postal.publish({
        channel: 'Loopback',
        topic: 'CreateHasManyObject',
        data: {
          containerObject: me,
          parentPropertyName: 'parentAminoId',
          containedObjects,
          callback: Util.checkCallback(cb)
        }
      });
    });
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
        callback: Util.checkCallback(cb)
      }
    });
  }

  get errors(): EtlError[] {
    return this._errors || [];
  }

  getPojo(): any {
    let me = this;
    return {
      id: me.id,
      name: me.name,
      aminoId: me.aminoId,
      parentAminoId: me.parentAminoId,
      errors: me.errors.map((error) => {
        return error.getPojo();
      })
    }
  }

  get id(): string {
    return this.getProperty<string>('id');
  }

  set parentAminoId(newParentAminoId: string) {
    this.setProperty<string>('parentAminoId', newParentAminoId);
  }

  get parentAminoId(): string {
    return this.getProperty<string>('parentAminoId');
  }

  get aminoId(): string {
    return this.getProperty<string>('aminoId');
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
    async.each(etlBase[collectionName],
      (etlBase: EtlBase, cb) => {
        try {
          etlBase[methodName](cb);
        } catch (err) {
          Util.checkCallback(cb)(err);
        }
      },
      () => {
        try {
          superMethod.bind(etlBase)(Util.checkCallback(cb));
        } catch (err) {
          Util.checkCallback(cb)(err);
        }
      });
  }
}
