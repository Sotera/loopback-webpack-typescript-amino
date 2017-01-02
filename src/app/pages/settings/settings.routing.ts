import { Routes, RouterModule }  from '@angular/router';

import { Settings } from './settings.component';
import {UserProfile} from "./components/user-profile/user-profile.component";

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: Settings,
    children: [
      { path: 'user-profile', component: UserProfile }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
