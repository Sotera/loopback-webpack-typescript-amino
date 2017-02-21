import {injectable, inject} from 'inversify';
import {IPostal, CommandUtil} from "firmament-yargs";
import {EtlFile} from "../interfaces/etl-file";
import {EtlBaseImpl} from "./etl-base-impl";
import {EtlFlow} from "../interfaces/etl-flow";
import {EtlBase} from "../interfaces/etl-base";
import * as _ from 'lodash';
const async = require('async');

@injectable()
export class EtlFileImpl extends EtlBaseImpl implements EtlFile {
  private _flows: EtlFlow[];

  constructor(@inject('IPostal') protected postal: IPostal) {
    super(postal);
  }

  writeToDb(cb: (err?: Error, etlBase?: EtlBase) => void) {
    let me = this;
    async.each(me.flows,
      //First do them ...
      (etlFlow: EtlFlow, cb) => {
        etlFlow.writeToDb(cb);
      },
      (err, results) => {
        //Now do me!
        super.writeToDb(cb);
      });
  }

  loadEntireObject(cb: (err?: Error, etlBase?: EtlBase) => void): void {
    let me = this;
    if (typeof cb !== 'function') {
      return;
    }
    async.waterfall([
      (cb) => {
        me.postal.publish({
          channel: 'Loopback',
          topic: 'Find',
          data: {
            className: 'EtlFlow',
            filter: {where: {parentFileAminoId: me.aminoId}},
            callback: cb
          }
        });
      },
      (etlFlows: EtlFlow[], cb) => {
        me._flows = etlFlows;
        async.map(etlFlows, (etlFlow, cb) => {
          etlFlow.loadEntireObject(cb);
        }, cb);
      }
    ], (err) => {
      cb(err, me);
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

  get pojo(): any {
    let retVal = JSON.parse(JSON.stringify(this.loopbackModel));
    retVal.flows = this.flows.map(flow => {
      return flow.pojo;
    });
    return retVal;
  }

  set parentFlowAminoId(newParentFlowAminoId) {
    this.loopbackModel.parentFlowAminoId = newParentFlowAminoId;
  }

  get parentFlowAminoId(): string {
    return this.loopbackModel.parentFlowAminoId;
  }

  set size(newSize) {
    this.loopbackModel.size = newSize;
  }

  get flows(): EtlFlow[] {
    return this._flows || [];
  }

  get size(): number {
    return this.loopbackModel.size;
  }

  set path(newPath) {
    this.loopbackModel.path = newPath;
  }

  get path(): string {
    return this.loopbackModel.path;
  }

  set createDate(newCreateDate) {
    this.loopbackModel.createDate = newCreateDate;
  }

  get createDate(): Date {
    return this.loopbackModel.createDate;
  }
}
