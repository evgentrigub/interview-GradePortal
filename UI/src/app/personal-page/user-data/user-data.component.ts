import { Component, OnInit, ChangeDetectorRef, Input, OnChanges, Output } from '@angular/core';
import { EditBaseComponent } from 'src/app/edit-base/edit-base-component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserData } from 'src/app/_models/user-view-model';
import { UserService } from 'src/app/_services/user.service';
import { MatSnackBar } from '@angular/material';
import { tap } from 'rxjs/operators';
import { Result } from 'src/app/_models/result-model';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { UserAuthenticated } from 'src/app/_models/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-data',
  templateUrl: './user-data.component.html',
  styleUrls: ['./user-data.component.css'],
})
export class UserDataComponent extends EditBaseComponent implements OnInit, OnChanges {
  @Input()
  userDataResult: Result<UserData> | null | undefined;

  @Input()
  pageOwner: boolean;

  public get userDataValue(): UserData {
    return this.userFormGroup.value;
  }

  userFormGroup: FormGroup;
  private previosUserDataState: UserData;
  private currentUser$: Observable<UserAuthenticated>;

  isLoading = true;

  constructor(
    private authenticate: AuthenticationService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private detector: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    super();
    this.userFormGroup = this.formBuilder.group({});
    this.currentUser$ = this.authenticate.currentUser;
  }

  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
    if (changes.hasOwnProperty('userDataResult')) {
      const chg = changes.userDataResult;
      const res = chg.currentValue as Result<UserData>;
      if (!res) {
        return;
      }
      this.isLoading = false;
      this.userFormGroup = this.getUserFormGroup(res.data);
    }
  }

  ngOnInit() { }

  protected Edit(): void {
    this.editMode = true;
    this.previosUserDataState = this.userFormGroup.value;
  }
  protected CancelEdit(): void {
    this.userFormGroup.setValue(this.previosUserDataState);
    this.editMode = false;
  }
  protected CanSave(): boolean {
    return this.userFormGroup.dirty && this.userFormGroup.valid;
  }
  protected Save(): void {
    const group = this.userFormGroup;
    if (!group) {
      return;
    }
    const data = group.value as UserData;
    this.userFormGroup.disable();
    this.userService
      .update(data)
      .pipe(
        tap(
          result => {
            if (result.isSuccess) {
              this.currentUser$.subscribe(res => {
                const user = this.changeUserInLocalStorage(data, res);
                this.isEditMode = false;
                this.userFormGroup.markAsPristine();
                this.userFormGroup.enable();
                this.detector.markForCheck();

                this.showMessage(result.message + ` Username: ${data.username}`);
                this.router.navigate([`/${user.username}`]);
              });
            }
          },
          err => this.showMessage(err)
        )
      )
      .subscribe();
  }

  /**
   * Change user data in local storage, saving authorization token
   * @param newUser new user data to set to storage
   * @param previousUser previous user data in storage
   */
  private changeUserInLocalStorage(newUser: UserData, previousUser: UserAuthenticated) {
    const user = newUser as UserAuthenticated;
    user.token = previousUser.token;
    this.authenticate.logout();

    localStorage.setItem('currentUser', JSON.stringify(user));
    this.authenticate.currentUserSubject.next(user);
    this.authenticate.currentUserSubject = new BehaviorSubject<UserAuthenticated>(JSON.parse(localStorage.getItem('currentUser')));
    return user;
  }

  /**
   * Return user FormGroup
   * @param data user data
   */
  private getUserFormGroup(data: UserData): FormGroup {
    return this.formBuilder.group({
      id: this.formBuilder.control(data.id),
      firstName: [data.firstName, [Validators.required, Validators.minLength(1)]],
      lastName: [data.lastName, [Validators.required, Validators.minLength(1)]],
      username: [data.username, [Validators.required, Validators.minLength(1)]],
      city: [data.city, [Validators.required, Validators.minLength(1)]],
      position: [data.position, [Validators.required, Validators.minLength(1)]],
    });
  }

  private showMessage(msg: any): void {
    this.snackBar.open(msg, 'ok');
  }
}
