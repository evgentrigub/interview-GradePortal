import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDataComponent } from './user-data.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import {
  MatSnackBarModule,
  MatProgressSpinnerModule,
  MatAutocompleteModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatTableModule,
  MatIconModule,
  MatButtonModule,
  MatPaginatorModule,
} from '@angular/material';
import { Result } from 'src/app/_models/result-model';
import { UserData } from 'src/app/_models/user-view-model';

describe('UserDataComponent', () => {
  let component: UserDataComponent;
  let fixture: ComponentFixture<UserDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserDataComponent],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        RouterTestingModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        MatAutocompleteModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatPaginatorModule,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDataComponent);
    component = fixture.componentInstance;
    component.userDataResult = USER_DATA_RESULT;
    component.pageOwner = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show user data', () => {

  });

  // it('should change view to edit mode', () => {

  // });

  // it('should cancel all changes in edit mode', () => {

  // });

  // it('should check validation for updating user data', () => {

  // });

  // it('should cancel all changes in edit mode', () => {

  // });

});

const USER_DATA_RESULT: Result<UserData> = {
  message: '',
  isSuccess: true,
  data: {
    num: 0,
    id: 'id',
    firstName: 'Eugene',
    lastName: 'Trigubov',
    username: 'evgentrigub',
    city: 'NY',
    position: 'dev'
  }
};
