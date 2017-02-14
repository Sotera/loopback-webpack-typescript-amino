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

  constructor(@inject('IPostal') private postal: IPostal,
              @inject('CommandUtil') private commandUtil: CommandUtil) {
    super();
  }

  loadEntireObject(cb: (err?: Error, etlBase?: EtlBase) => void): void {
    let me = this;
    if (typeof cb !== 'function') {
      return;
    }
    me.postal.publish({
      channel: 'Loopback',
      topic: 'Find',
      data: {
        className: 'EtlFlow',
        filter: {where: {parentFileAminoId: me.aminoId}},
        callback: (err, etlFlows: EtlFlow[]) => {
          me._flows = etlFlows;
          cb(err, me);
        }
      }
    });
  }

  addFlows(flows: any[], cb: (err: Error, etlFlows: EtlFlow[]) => void) {
    let me = this;
    async.waterfall([
        (cb) => {
          //Get the flow template
          let fnArray = [];
          flows.forEach((flow: EtlFlow) => {
            fnArray.push(
              async.apply(
                (flow: EtlFlow, cb: (err: Error, foundObject) => void) => {
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
                },
                flow));
          });
          async.parallel(fnArray, (err, etlFlows: EtlFlow[]) => {
            etlFlows = etlFlows.filter(flow => {
              return !!flow;
            });
            cb(err, etlFlows);
          });
        },
        (etlFlows: EtlFlow[], cb) => {
          //Get the steps for each flow
          async.each(etlFlows, (etlFlow: EtlFlow, cb) => {
            etlFlow.loadEntireObject(cb);
          }, (err) => {
            cb(err, etlFlows);
          });
        },
        (flows: EtlFlow[], cb) => {
          //Create flows with found flow templates
          let containedObjects = [];
          flows.forEach(flow => {
            let initializationObject = flow.pojo;
            initializationObject = _.omit(initializationObject, ['id', 'aminoId', 'type']);
            containedObjects.push({
              className: 'EtlFlow',
              initializationObject
            });
          });
          me.postal.publish({
            channel: 'Loopback',
            topic: 'CreateHasManyObject',
            data: {
              containerObject: me,
              containedObjects,
              callback: cb
            }
          });
        },
        (etlFlows, cb) => {
          async.each(etlFlows, (etlFlow: EtlFlow, cb) => {
            let stepsToAdd = [];
            etlFlow.loopbackModel.steps.forEach(step => {
              stepsToAdd.push({name: step.name});
            });
            etlFlow.addSteps(stepsToAdd, (err, results) => {
              //Remove 'steps' property from etlFlow
              me.postal.publish({
                channel: 'Loopback',
                topic: 'UpdateAttribute',
                data: {
                  className: 'EtlFlow',
                  loopbackModelToUpdate: etlFlow.loopbackModel,
                  attributeName: 'steps',
                  newAttributeValue: null,
                  callback: (err, etlFlow: EtlFlow) => {
                    cb(err, etlFlow);
                  }
                }
              });
            });
          }, (err) => {
            cb(err);
          });
        }
      ],
      (err: Error, results) => {
        me.loadEntireObject(err => {
          cb(err, results);
        });
      });
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
