import {EtlBase} from "./etl-base";
import {EtlStep} from "./etl-step";
export interface EtlFlow extends EtlBase {
  type: string;
  expanded: boolean;
  currentStepIndex: number;
  steps: EtlStep[];
  addSteps(steps: any[], cb: (err: Error, etlSteps: EtlStep[]) => void): void;
}
