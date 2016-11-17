import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import {FormsModule as AngularFormsModule, ReactiveFormsModule} from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';
import {AlertModule} from "../../modules/alert.module";

import { routing }       from './vita.routing';
import { Vita } from './vita.component';
import {EtlTask1} from "./components/etl-task1/etl-task1.component";
import {EtlActivity} from "./components/etl-activity/etl-activity.component";
import {EtlFileManager} from "./components/etl-fileManager/etl-fileManager.component";
import {EtlFlow} from "./components/etl-flow/etl-flow.component";
import {EtlFlowForm} from "./components/etl-flow/components/etlFlowForm/etlFlowForm.component";


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AngularFormsModule,
    AlertModule,
    NgaModule,
    routing
  ],
  declarations: [
    Vita,
    EtlTask1,
    EtlActivity,
    EtlFileManager,
    EtlFlow,
    EtlFlowForm
  ]
})
export default class VitaModule {
}
