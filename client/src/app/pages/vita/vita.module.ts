import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';

import { routing }       from './vita.routing';
import { Vita } from './vita.component';
import {EtlTask1} from "./components/etl-task1/etl-task1.component";
import {EtlActivity} from "./components/etl-activity/etl-activity.component";
import {EtlFileManager} from "./components/etl-fileManager/etl-fileManager.component";


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgaModule,
    routing
  ],
  declarations: [
    Vita,
    EtlTask1,
    EtlActivity,
    EtlFileManager
  ]
})
export default class VitaModule {
}
