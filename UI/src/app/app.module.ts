import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import 'hammerjs';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LoginComponent } from './account/login/login.component';
import { RegisterComponent } from './account/register/register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { JwtInterceptor } from './account/jwt.interceptor';
import { ErrorInterceptor } from './account/error.interceptor';
import { MaterialModule } from './material-module';
import { appRoutingModule } from './app.routing';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { TableComponent } from './table/table.component';
import { PersonalPageComponent } from './account/personal-page/personal-page.component';

@NgModule({
  declarations: [AppComponent, TableComponent, LoginComponent, RegisterComponent, NavBarComponent, PersonalPageComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
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
export class AppModule {}
