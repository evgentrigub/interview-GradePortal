import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../_services/authentication.service';
import { first, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { User } from 'src/app/_models/user';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  readonly registerForm: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private snackbar: MatSnackBar
  ) {
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/']);
    }
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      city: [null, [Validators.minLength(3)]],
      position: [null, [Validators.minLength(3)]],
      password: ['', Validators.required],
    });
  }

  /**
   * Check validation for registration
   */
  canSubmit(): boolean {
    return this.registerForm.valid;
  }

  /**
   * Sumbit the register form for registration
   */
  onSubmit(): void {
    if (!this.canSubmit()) {
      return;
    }

    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    const user = this.registerForm.value as User;
    setTimeout(() => {
      this.authenticationService
        .register(user)
        .pipe(
          first(),
          switchMap(_ => {
            return this.authenticationService.login(user.username, user.password);
          })
        )
        .subscribe(
          _ => {
            this.router.navigate(['/table']);
            this.showMessage('Sign up success!');
            this.isLoading = false;
          },
          error => {
            this.isLoading = false;
            this.showMessage(error);
          }
        );
    }, 1500);
  }

  private showMessage(message: any) {
    this.snackbar.open(message, 'OK', { duration: 3000 });
  }
}
