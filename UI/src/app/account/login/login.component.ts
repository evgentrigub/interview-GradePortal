import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../_services/authentication.service';
import { first } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';

interface AuthModel {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  readonly loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private snackbar: MatSnackBar
  ) {
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/table']);
    }
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', Validators.required],
    });
  }

  /**
   * Check validation for authentication
   */
  canSubmit(): boolean {
    return this.loginForm.valid;
  }

  /**
   * Sumbit the login form for authentication
   */
  onSubmit(): void {
    if (!this.canSubmit()) {
      return;
    }

    if (this.loginForm.invalid) {
      return;
    }
    const user = this.loginForm.value as AuthModel;

    this.isLoading = true;
    this.authenticationService
      .login(user.username, user.password)
      .pipe(first())
      .subscribe(
        _ => {
          this.isLoading = false;
          this.router.navigate(['/table']);
          this.showMessage('Log in success!');
        },
        error => {
          this.isLoading = false;
          this.showMessage(error);
        }
      );
  }

  private showMessage(message: any) {
    this.snackbar.open(message, 'OK', { duration: 3000 });
  }
}
