import {injectable, inject} from 'inversify';
import {IPostal, CommandUtil} from 'firmament-yargs';
import {EtlBaseImpl} from './etl-base-impl';
import {EtlFlow} from '../interfaces/etl-flow';
import {EtlStep} from '../interfaces/etl-step';
import {EtlBase} from '../interfaces/etl-base';
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
        filter: {where: {parentFlowAminoId: me.aminoId}},
        callback: (err, etlSteps: EtlStep[]) => {
          me._steps = etlSteps;
          EtlBaseImpl.checkCallback(cb)(err, me);
        }
      }
    });
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
          callback: EtlBaseImpl.checkCallback(cb)
        }
      });
    });
  }

  get steps(): EtlStep[] {
    return this._steps || [];
  }

  get pojo(): any {
    let retVal = JSON.parse(JSON.stringify(this.loopbackModel));
    retVal.steps = this.steps.map(step => {
      return step.pojo;
    });
    return retVal;
  }

  set status(newStatus: string) {
    this.setProperty<string>('status', newStatus);
  }

  get status(): string {
    return this.getProperty<string>('status');
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

  set parentFileAminoId(newParentFileAminoId: string) {
    this.setProperty<string>('parentFileAminoId', newParentFileAminoId);
  }

  get parentFileAminoId(): string {
    return this.getProperty<string>('parentFileAminoId');
  }
}
