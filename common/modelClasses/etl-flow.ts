import {EtlStep} from "./etl-step";
import {EtlBase} from "./etl-base";
import * as _ from 'lodash';
const async = require('async');
export class EtlFlow extends EtlBase {
  etlSteps: EtlStep[];

  private constructor(protected loopbackModelInstance: any = null) {
    super(EtlBase.server.models.EtlFlow, {include: ['steps']}, loopbackModelInstance);
  }

  set expanded(newExpanded) {
    this.typeScriptObject.expanded = newExpanded;
  }

  get expanded(): string {
    return this.typeScriptObject.expanded;
  }

  set etlFileId(newEtlFileId) {
    this.typeScriptObject.etlFileId = newEtlFileId;
  }

  get etlFileId(): string {
    return this.typeScriptObject.etlFileId;
  }

  set lastStatus(newLastStatus) {
    this.typeScriptObject.lastStatus = newLastStatus;
  }

  get lastStatus(): string {
    return this.typeScriptObject.lastStatus;
  }

  get steps(): EtlStep[] {
    return this.etlSteps;
  }

  private loadEtlSteps(cb: (err, flows?) => void) {
    let me = this;
    let fnArray = [];
    me.typeScriptObject.steps.forEach(step => {
      fnArray.push(async.apply((step, cb) => {
        EtlStep.findById(step.id, (err, etlStep) => {
          cb(err, etlStep);
        });
      }, step));
    });
    async.parallel(fnArray, (err, results) => {
      cb(err, me.etlSteps = results);
    });
  }

  createStep(typeScriptObject, cb: (err, etlStep: EtlStep) => void) {
    let me = this;
    this._createHasManyInstance('steps', typeScriptObject, (err, etlStep) => {
      me.loadEtlSteps(err => {
        let newEtlStep = _.find(me.etlSteps, s => {
          return etlStep.id.toString() === s.id;
        });
        cb(err, newEtlStep);
      });
    });
  }

  static createFromLoopbackInstance(loopbackInstance, cb: (err, etlFlow: EtlFlow) => void) {
    let newEtlFlow = new EtlFlow(loopbackInstance);
    cb(null, newEtlFlow);
    /*    newEtlFlow.loadEtlSteps(err => {
     cb(err, newEtlFlow);
     });*/
  }

  static findById(id, cb: (err, etlFlow: EtlFlow) => void) {
    new EtlFlow()._findById(id, cb);
  }
}
