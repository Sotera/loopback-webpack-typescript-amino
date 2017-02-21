import {inject, injectable} from 'inversify';
import {IPostal} from "firmament-yargs";
import {EtlBase} from "../interfaces/etl-base";

@injectable()
export class EtlBaseImpl implements EtlBase {
  protected updateObject = {};
  loopbackModel: any;

  constructor(protected postal: IPostal) {
  }

  get loopbackClassName() {
    return this.constructor.name.replace(/Impl/, '');
  }

  writeToDb(cb: (err?: Error, etlBase?: EtlBase) => void) {
    let me = this;
    me.postal.publish({
      channel: 'Loopback',
      topic: 'UpdateAttributes',
      data: {
        className: me.loopbackClassName,
        loopbackModelToUpdate: me.loopbackModel,
        updatedAttributes: me.updateObject,
        callback: me.checkCallback(cb)
      }
    });
  }

  loadEntireObject(cb: (err?: Error, etlBase?: EtlBase) => void): void {
    this.checkCallback(cb)();
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

  protected checkCallback(cb: any) {
    return (typeof cb === 'function') ? cb : (() => {
      });
  }
}
