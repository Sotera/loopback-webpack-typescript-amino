import {NgModule}      from '@angular/core';
import {CommonModule}  from '@angular/common';

import {routing}       from './pages.routing';
import {NgaModule} from '../theme/nga.module';

import {Pages} from './pages.component';
import {AlertComponent} from "../_directives/alert.component";

@NgModule({
  imports: [CommonModule, NgaModule, routing],
  declarations: [Pages
  ]
})
export class PagesModule {
}
