import {injectable, inject} from 'inversify';
import {IPostal, CommandUtil} from "firmament-yargs";
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

  constructor(@inject('IPostal') protected postal: IPostal) {
    super(postal);
  }

  get steps(): EtlStep[] {
    return this._steps || [];
  }

  writeToDb(cb: (err?: Error, etlBase?: EtlBase) => void) {
    let me = this;
    async.each(me.steps,
      //First do them ...
      (etlStep: EtlStep, cb) => {
        etlStep.writeToDb(cb);
      },
      (err, results) => {
        //Now do me!
        super.writeToDb(cb);
      });
  }

  loadEntireObject(cb: (err?: Error, etlBase?: EtlBase) => void): void {
    let me = this;
    cb = me.checkCallback(cb);
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

  set status(newStatus: string) {
    this.setProperty<string>('status', newStatus);
  }

  get status(): string {
    return this.getProperty<string>('status');
  }

  set currentStepIndex(newCurrentStepIndex: number) {
    this.loopbackModel.currentStepIndex = newCurrentStepIndex;
  }

  get currentStepIndex(): number {
    return this.loopbackModel.currentStepIndex;
  }

  set type(newType: string) {
    this.loopbackModel.type = newType;
  }

  get type(): string {
    return this.loopbackModel.type;
  }

  set parentFileAminoId(newParentFileAminoId: string) {
    this.loopbackModel.parentFileAminoId = newParentFileAminoId;
  }

  get parentFileAminoId(): string {
    return this.loopbackModel.parentFileAminoId;
  }

  addSteps(steps: any[], cb: (err: Error, etlSteps: EtlStep[]) => void): void {
    let me = this;
    async.map(steps, (step, cb) => {
      cb(null, {
        className: 'EtlStep',
        initializationObject: {
          name: step.name
        }
      });
    }, (err, containedObjects) => {
      me.postal.publish({
        channel: 'Loopback',
        topic: 'CreateHasManyObject',
        data: {
          containerObject: me,
          parentPropertyName: 'parentFlowAminoId',
          containedObjects,
          callback: cb
        }
      });
    });
  }

  get pojo(): any {
    let retVal = JSON.parse(JSON.stringify(this.loopbackModel));
    retVal.steps = this.steps.map(step => {
      return step.pojo;
    });
    return retVal;
  }
}
