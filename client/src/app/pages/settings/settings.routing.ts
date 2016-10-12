import { Routes, RouterModule }  from '@angular/router';

import { Settings } from './settings.component';
import { Inputs } from './components/inputs/inputs.component';
import { Layouts } from './components/layouts/layouts.component';

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: Settings,
    children: [
      { path: 'inputs', component: Inputs },
      { path: 'layouts', component: Layouts }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
