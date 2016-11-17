import {Routes, RouterModule}  from '@angular/router';

import {Vita} from './vita.component';
// import {EtlTask1} from "./components/etl-task1/etl-task1.component";
import {EtlActivity} from "./components/etl-activity/etl-activity.component";
// import {EtlFileManager} from "./components/etl-fileManager/etl-fileManager.component"
import {EtlFlow} from "./components/etl-flow/etl-flow.component"
import {EtlFlowForm} from "./components/etl-flow/components/etlFlowForm/etlFlowForm.component"

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: Vita,
    children: [
      // {path: 'etl-task1', component: EtlTask1},
      {path: 'etl-activity', component: EtlActivity},
      // {path: 'etl-fileManager', component: EtlFileManager}
      {path: 'etl-flow', component: EtlFlow},
      {path: 'etl-flow-form', component: EtlFlowForm}
    ]
  }
];

export const routing = RouterModule.forChild(routes);

