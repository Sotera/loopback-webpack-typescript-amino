import {NgModule}      from '@angular/core';
import {CommonModule}  from '@angular/common';
import {FormsModule as AngularFormsModule} from '@angular/forms';
import {NgaModule} from '../../theme/nga.module';

import {routing}       from './settings.routing';

import {RatingModule} from 'ng2-bootstrap/ng2-bootstrap';
import {Settings} from './settings.component';
import {UserProfile} from "./components/user-profile/user-profile.component";
import {UserProfileForm} from "./components/user-profile/components/userProfileForm/userProfileForm.component";

@NgModule({
  imports: [
    CommonModule,
    AngularFormsModule,
    NgaModule,
    RatingModule,
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
