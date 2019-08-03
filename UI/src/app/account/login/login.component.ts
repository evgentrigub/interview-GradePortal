import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, MinLengthValidator } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { first, retry, timeout } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { ok } from 'assert';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  hide = true;
  value = '';

  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private snackbar: MatSnackBar
  ) {
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.returnUrl = this.route.snapshot.queryParams.returnUrl || 'home';
  }

  get f() {
    return this.loginForm.controls;
  }
  // TO-DO ошибки добавить в разметку позже
  getErrorLogin() {
    return this.loginForm.get('username').hasError('required') ? 'Логин не может быть пустым' : '';
  }
  getErrorPassword() {
    return this.loginForm.get('password').hasError('required') ? 'Пароль не может быть пустым' : '';
  }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    // setTimeout(() => {
    this.authenticationService
      .login(this.f.username.value, this.f.password.value)
      .pipe(first())
      .subscribe(
        data => {
          this.loading = false;
          this.router.navigate([this.returnUrl]);
          this.showMessage('Вход успешно выполнен');
        },
        error => {
          this.showErrorMessage(error);
          this.loading = false;
        }
      );
    // }, 1500);
  }

  forgetPassword() {
    this.showMessage('Функция пока не доступна');
  }

  private showErrorMessage(message: HttpErrorResponse) {
    this.snackbar.open(message.error.message, 'OK', { duration: 6000 });
  }
  private showMessage(message: any) {
    this.snackbar.open(message, 'OK', { duration: 3000 });
  }
}
