import {NgModule}      from '@angular/core';
import {CommonModule}  from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgaModule} from '../../theme/nga.module';
import {Login} from './login.component';
import {routing}       from './login.routing';
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
    Login
  ],
  providers: []
})
export default class LoginModule {
}
