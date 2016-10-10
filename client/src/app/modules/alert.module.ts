import {NgModule}      from '@angular/core';
import {AlertComponent} from "../_directives/alert.component";
import {CommonModule} from "@angular/common";

@NgModule({
  imports: [CommonModule],
  declarations: [
    AlertComponent
  ],
  exports:[
    AlertComponent
  ],
  providers: []
})
export class AlertModule {
}
