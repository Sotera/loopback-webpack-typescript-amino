import {injectable, inject} from 'inversify';
import {IPostal} from "firmament-yargs";
import {EtlBaseImpl} from "./etl-base-impl";
import {EtlFlow} from "../interfaces/etl-flow";
import {EtlStep} from "../interfaces/etl-step";
import * as _ from 'lodash';
import {EtlBase} from "../interfaces/etl-base";
const async = require('async');

@injectable()
export class EtlFlowImpl extends EtlBaseImpl implements EtlFlow {
  private _steps: EtlStep[];
  expanded: boolean;

  constructor(@inject('IPostal') private postal: IPostal) {
    super();
  }

  get steps(): EtlStep[] {
    return this._steps || [];
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
        className: 'EtlStep',
        filter: {where: {parentFlowAminoId: me.aminoId}},
        callback: (err, etlSteps: EtlStep[]) => {
          me._steps = etlSteps;
          cb(err, me);
        }
      }
    });
  }

  set parentFileAminoId(newParentFileAminoId) {
    this.loopbackModel.parentFileAminoId = newParentFileAminoId;
  }

  get parentFileAminoId(): string {
    return this.loopbackModel.parentFileAminoId;
  }

  addSteps(steps: any[], cb: (err: Error, etlSteps: EtlStep[]) => void): void {
    let me = this;
    async.waterfall([
        (cb) => {
          //Get the flow template
          let fnArray = [];
          let flows = [];
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
        (flows, cb) => {
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
            etlFlow.loadEntireObject(cb);
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
    retVal.steps = this.steps.map(step=>{return step.pojo;});
    return retVal;
  }
}
