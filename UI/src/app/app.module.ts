import 'hammerjs';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ErrorInterceptor } from './account/error.interceptor';
import { JwtInterceptor } from './account/jwt.interceptor';
import { LoginComponent } from './account/login/login.component';
import { RegisterComponent } from './account/register/register.component';
import { AppComponent } from './app.component';
import { appRoutingModule } from './app.routing';
import { MaterialModule } from './material-module';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { PersonalPageComponent } from './personal-page/personal-page.component';
import { SearchPanelComponent } from './table/search-panel/search-panel.component';
import { TableComponent } from './table/table.component';
import { UserDataComponent } from './personal-page/user-data/user-data.component';
import { SkillsTableComponent } from './personal-page/skills-table/skills-table.component';

@NgModule({
  declarations: [
    AppComponent,
    TableComponent,
    LoginComponent,
    RegisterComponent,
    NavBarComponent,
    PersonalPageComponent,
    SearchPanelComponent,
    UserDataComponent,
    SkillsTableComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MaterialModule,
    appRoutingModule,
    HttpClientModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
