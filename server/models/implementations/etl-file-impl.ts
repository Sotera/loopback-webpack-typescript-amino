import {injectable, inject} from 'inversify';
import {IPostal, CommandUtil} from "firmament-yargs";
import {EtlFile} from "../interfaces/etl-file";
import {EtlBaseImpl} from "./etl-base-impl";
import {EtlFlow} from "../interfaces/etl-flow";
import {EtlBase} from "../interfaces/etl-base";
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
        filter: {where: {parentFileAminoId: me.aminoId}},
        callback: (err, etlFlows: EtlFlow[]) => {
          me._flows = etlFlows;
          async.map(etlFlows, (etlFlow, cb) => {
            etlFlow.loadEntireObject(cb);
          }, cb);
        }
      }
    });
  }

  addFlows(flows: any[], cb: (err: Error, etlFlows: EtlFlow[]) => void) {
    let me = this;
    async.waterfall([
      (cb) => {
        async.map(flows, (flow, cb) => {
          me.postal.publish({
            channel: 'Loopback',
            topic: 'Find',
            data: {
              className: 'EtlFlow',
              filter: {where: {and: [{name: flow.name}, {type: 'template'}]}},
              callback: (err, etlFlows: EtlFlow[]) => {
                cb(err, etlFlows.length ? etlFlows[0] : null);
              }
            }
          });
        }, (err, etlFlows: EtlFlow[]) => {
          cb(err, etlFlows.filter(etlFlow => {
            return !!etlFlow;
          }));
        });
      },
      (etlFlows: EtlFlow[], cb) => {
        //Get the steps for each flow
        async.map(etlFlows, (etlFlow: EtlFlow, cb) => {
          etlFlow.loadEntireObject(cb);
        }, cb);
      },
      (etlFlows: EtlFlow[], cb) => {
        async.map(etlFlows, (etlFlow: EtlFlow, cb) => {
          let steps = etlFlow.pojo.steps.map(step => {
            return {name: step.name};
          });
          cb(null, {
            className: 'EtlFlow',
            initializationObject: {
              name: etlFlow.pojo.name, steps
            }
          });
        }, (err, containedObjects) => {
          me.postal.publish({
            channel: 'Loopback',
            topic: 'CreateHasManyObject',
            data: {
              containerObject: me,
              parentPropertyName: 'parentFileAminoId',
              containedObjects,
              callback: cb
            }
          });
        });
      },
      (etlFlows: EtlFlow[], cb) => {
        async.map(etlFlows, (etlFlow: EtlFlow, cb) => {
          let steps = etlFlow.loopbackModel.steps.map(step => {
            return {name: step.name};
          });
          etlFlow.addSteps(steps, () => {
            //Remove 'steps' property from etlFlow
            me.postal.publish({
              channel: 'Loopback',
              topic: 'UpdateAttribute',
              data: {
                className: 'EtlFlow',
                loopbackModelToUpdate: etlFlow.loopbackModel,
                attributeName: 'steps',
                newAttributeValue: null,
                callback: (err) => {
                  cb(err, etlFlow);
                }
              }
            });
          });
        }, cb);
      }
    ], cb);
  }

  get flows(): EtlFlow[] {
    return this._flows || [];
  }

  get pojo(): any {
    let retVal = JSON.parse(JSON.stringify(this.loopbackModel));
    retVal.flows = this.flows.map(flow => {
      return flow.pojo;
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
