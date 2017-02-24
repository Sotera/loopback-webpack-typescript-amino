import {injectable, inject} from 'inversify';
import {IPostal, CommandUtil} from "firmament-yargs";
import {EtlBaseImpl} from "./etl-base-impl";
import {Util} from "../../util/util";
import {EtlFile, EtlFlow, EtlBase} from "../../../node_modules/etl-typings/index";
const async = require('async');

@injectable()
export class EtlFileImpl extends EtlBaseImpl implements EtlFile {
  private _flows: EtlFlow[];

  constructor(@inject('CommandUtil') protected commandUtil: CommandUtil,
              @inject('IPostal') protected postal: IPostal) {
    super(commandUtil, postal);
  }

  removeFromDb(cb?: (err?: Error, etlBase?: EtlBase) => void) {
    EtlBaseImpl.executeOnCollections(this, super['removeFromDb'], 'flows', 'removeFromDb', cb);
  }

  writeToDb(cb: (err?: Error, etlBase?: EtlBase) => void) {
    EtlBaseImpl.executeOnCollections(this, super['writeToDb'], 'flows', 'writeToDb', cb);
  }

  loadEntireObject(cb: (err?: Error, etlBase?: EtlBase) => void): void {
    let me = this;
    me.postal.publish({
      channel: 'Loopback',
      topic: 'Find',
      data: {
        className: 'EtlFlow',
        filter: {where: {parentAminoId: me.aminoId}},
        callback: (err, etlFlows: EtlFlow[]) => {
          me._flows = etlFlows;
          async.map(etlFlows, (etlFlow, cb) => {
            etlFlow.loadEntireObject(cb);
          }, (err) => {
            if (me.commandUtil.callbackIfError(cb, err)) {
              return;
            }
            super.loadEntireObject((err) => {
              cb(err, me);
            });
          });
        }
      }
    });
  }

  addFlows(flows: any[], cb: (err: Error, etlFlows: EtlFlow[]) => void) {
    let me = this;
    async.map(flows, (flow, cb) => {
      cb(null, {
        className: 'EtlFlow',
        initializationObject: {
          name: flow.name
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
          callback: (err, etlFlows: EtlFlow[]) => {
            Util.checkCallback(cb)(err, etlFlows);
          }
        }
      });
    });
  }

  get flows(): EtlFlow[] {
    return this._flows || [];
  }

  getPojo(): any {
    let me = this;
    let retVal = super.getPojo();
    retVal.size = me.size;
    retVal.path = me.path;
    retVal.createDate = me.createDate;
    retVal.flows = me.flows.map((flow) => {
      return flow.getPojo();
    });
    return retVal;
  }

  set size(newSize: number) {
    this.setProperty<number>('size', newSize);
  }

  get size(): number {
    return this.getProperty<number>('size');
  }

  set path(newPath: string) {
    this.setProperty<string>('path', newPath);
  }

  get path(): string {
    return this.getProperty<string>('path');
  }

  set createDate(newCreateDate: Date) {
    this.setProperty<Date>('createDate', newCreateDate);
  }

  get createDate(): Date {
    return this.getProperty<Date>('createDate');
  }
}
