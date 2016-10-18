import {Routes, RouterModule}  from '@angular/router';

import {Vita} from './vita.component';
import {EtlTask1} from "./components/etl-task1/etl-task1.component";

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: Vita,
    children: [
      {path: 'etl-task1', component: EtlTask1}
    ]
  }
];

export const routing = RouterModule.forChild(routes);
