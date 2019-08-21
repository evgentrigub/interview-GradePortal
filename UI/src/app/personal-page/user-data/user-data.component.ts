import { Component, OnInit, ChangeDetectorRef, Input, OnChanges, Output } from '@angular/core';
import { EditBaseComponent } from 'src/app/edit-base/edit-base-component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserData } from 'src/app/_models/user-view-model';
import { UserService } from 'src/app/_services/user.service';
import { MatSnackBar } from '@angular/material';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-user-data',
  templateUrl: './user-data.component.html',
  styleUrls: ['./user-data.component.css']
})
export class UserDataComponent extends EditBaseComponent implements OnInit, OnChanges {

  @Input()
  userData: UserData | null | undefined;

  @Input()
  pageOwner: boolean;

  public get userDataValue(): UserData {
    return this.userFormGroup.value;
  }

  userFormGroup: FormGroup;
  private previosUserDataState: UserData;

  isLoading = true;

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private detector: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {
    super();
    this.userFormGroup = this.formBuilder.group({});
  }

  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
    if (changes.hasOwnProperty('userData')) {
      const chg = changes.userData;
      const data = chg.currentValue;
      if (!data) {
        return;
      }
      this.isLoading = false;
      this.userFormGroup = this.createUserFormGroup(data);
    }
  }

  ngOnInit() {
  }

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
          () => {
            this.showMessage(`Account updated successfully! Username: ${data.username}`);
            this.isEditMode = false;
            this.userFormGroup.markAsPristine();
            this.userFormGroup.enable();
            this.detector.markForCheck();
          },
          err => this.showMessage(err)
        )
      )
      .subscribe();
  }

  private createUserFormGroup(data: UserData): FormGroup {
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
