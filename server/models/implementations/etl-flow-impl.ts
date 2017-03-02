import {injectable, inject} from 'inversify';
import {IPostal, CommandUtil} from 'firmament-yargs';
import {EtlBaseImpl} from './etl-base-impl';
import {Util} from "../../util/util";
import {EtlFlow, EtlStep, EtlBase} from "../../../node_modules/etl-typings/index";
const async = require('async');

@injectable()
export class EtlFlowImpl extends EtlBaseImpl implements EtlFlow {
  private _steps: EtlStep[];
  expanded: boolean;

  constructor(@inject('CommandUtil') protected commandUtil: CommandUtil,
              @inject('IPostal') protected postal: IPostal) {
    super(commandUtil, postal);
  }

  removeFromDb(cb?: (err?: Error, etlBase?: EtlBase) => void) {
    EtlBaseImpl.executeOnCollections(this, super['removeFromDb'], 'steps', 'removeFromDb', cb);
  }

  writeToDb(cb: (err?: Error, etlBase?: EtlBase) => void) {
    EtlBaseImpl.executeOnCollections(this, super['writeToDb'], 'steps', 'writeToDb', cb);
  }

  loadEntireObject(cb: (err?: Error, etlBase?: EtlBase) => void): void {
    let me = this;
    me.postal.publish({
      channel: 'Loopback',
      topic: 'Find',
      data: {
        className: 'EtlStep',
        filter: {where: {parentAminoId: me.aminoId}},
        callback: (err, etlSteps: EtlStep[]) => {
          me._steps = etlSteps;
          async.map(etlSteps, (etlStep, cb) => {
            etlStep.loadEntireObject(cb);
          }, (err) => {
            super.loadEntireObject((err) => {
              cb(err, me);
            });
          });
        }
      }
    });
  }

  addSteps(steps: any[], cb: (err: Error, etlSteps: EtlStep[]) => void): void {
    let me = this;
    async.map(steps, (step, cb) => {
      cb(null, {
        className: 'EtlStep',
        initializationObject: step
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

  get steps(): EtlStep[] {
    return this._steps || [];
  }

  getPojo(): any {
    let me = this;
    let retVal = super.getPojo();
    retVal.currentStepIndex = me.currentStepIndex;
    retVal.steps = me.steps.map((step) => {
      return step.getPojo();
    });
    return retVal;
  }

  set currentStepIndex(newCurrentStepIndex: number) {
    this.setProperty<number>('currentStepIndex', newCurrentStepIndex);
  }

  get currentStepIndex(): number {
    return this.getProperty<number>('currentStepIndex');
  }

  set type(newType: string) {
    this.setProperty<string>('type', newType);
  }

  get type(): string {
    return this.getProperty<string>('type');
  }
}
