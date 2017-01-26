import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';

import { routing }       from './vita.routing';
import { Vita } from './vita.component';
import {EtlActivity} from "./components/etl-activity/etl-activity.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgaModule,
    routing
  ],
  declarations: [
    Vita,
    EtlActivity
  ]
})
export default class VitaModule {
}
