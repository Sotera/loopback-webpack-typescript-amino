import {NgModule}      from '@angular/core';
import {CommonModule}  from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgaModule} from '../../theme/nga.module';
import {Register} from './register.component';
import {routing}       from './register.routing';
import {AlertModule} from "../../modules/alert.module";

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AlertModule,
    NgaModule,
    routing
  ],
  declarations: [
    Register
  ]
})
export default class RegisterModule {
}
