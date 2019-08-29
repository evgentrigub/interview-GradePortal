import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatFormFieldModule,
  MatIconModule,
  MatButtonModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatInputModule,
} from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule,
        HttpClientModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatInputModule,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const inputName = fixture.debugElement.query(By.css('input.name')).nativeElement as HTMLInputElement;
    const inputPassword = fixture.debugElement.query(By.css('input.password')).nativeElement as HTMLInputElement;

    inputName.value = 'evgen';
    inputName.dispatchEvent(new Event('input'));

    inputPassword.value = 'qwerty';
    inputPassword.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check validation and enable button', () => {
    expect(component.canSubmit()).toBe(true);
  });

  it('should check validation and disable button', () => {
    // arrange
    const inputName = fixture.debugElement.query(By.css('input.name')).nativeElement as HTMLInputElement;
    const inputPassword = fixture.debugElement.query(By.css('input.password')).nativeElement as HTMLInputElement;

    // act
    inputName.value = 'e';
    inputName.dispatchEvent(new Event('input'));

    inputPassword.value = '';
    inputPassword.dispatchEvent(new Event('input'));

    // assert
    expect(component.canSubmit()).toBe(false);
  });

  it('should get and send login form', () => {
    // arrange
    const usernameControl = component.loginForm.get('username');
    const passwordControl = component.loginForm.get('password');

    if (!usernameControl || !passwordControl) {
      return;
    }

    // assert
    const val = component.loginForm.value;

    expect(val.username).toBeTruthy();
    expect(val.password).toBeTruthy();
    expect(usernameControl).toBeTruthy();
    expect(passwordControl).toBeTruthy();
  });

});
