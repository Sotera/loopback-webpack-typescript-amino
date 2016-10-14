import {NgModule}      from '@angular/core';
import {CommonModule}  from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgaModule} from '../../theme/nga.module';

import {routing}       from './settings.routing';

import {RatingModule} from 'ng2-bootstrap/ng2-bootstrap';
import {Settings} from './settings.component';
import {UserProfile} from "./components/user-profile/user-profile.component";
import {UserProfileForm} from "./components/user-profile/components/userProfileForm/userProfileForm.component";
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
    UserProfile,
    Settings,
    UserProfileForm
  ]
})
export default class FormsModule {
}
