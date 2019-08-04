import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './account/auth.guard';
import { LoginComponent } from './account/login/login.component';
import { RegisterComponent } from './account/register/register.component';
import { TableComponent } from './table/table.component';
import { PersonalPageComponent } from './account/personal-page/personal-page.component';

const routes: Routes = [
  { path: 'table', component: TableComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'account', component: PersonalPageComponent },

  { path: '**', redirectTo: 'table' },
];

export const appRoutingModule = RouterModule.forRoot(routes);
