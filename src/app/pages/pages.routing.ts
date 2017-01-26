import {Routes, RouterModule}  from '@angular/router';
import {Pages} from './pages.component';
import {AuthGuard} from "../_guards/auth.guard";
// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => System.import('./login/login.module')
  },
  {
    path: 'register',
    loadChildren: () => System.import('./register/register.module')
  },
  {
    path: 'pages',
    component: Pages,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadChildren: () => System.import('./dashboard/dashboard.module') },
      { path: 'vita', loadChildren: () => System.import('./vita/vita.module') }
    ]
    ,canActivate: [AuthGuard]
  }
];

export const routing = RouterModule.forChild(routes);
