import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDataComponent } from './user-data.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Result } from 'src/app/_models/result-model';
import { UserData } from 'src/app/_models/user-view-model';
import { MaterialModule } from 'src/app/material-module';
import { By } from '@angular/platform-browser';

// tslint:disable: no-use-before-declare

describe('UserDataComponent', () => {
  let component: UserDataComponent;
  let fixture: ComponentFixture<UserDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserDataComponent],
      imports: [BrowserAnimationsModule, HttpClientTestingModule, ReactiveFormsModule, RouterTestingModule, MaterialModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDataComponent);
    component = fixture.componentInstance;
    component.userDataResult = USER_DATA_RESULT;
    component.pageOwner = true;
    fixture.detectChanges();

    component.ngOnChanges({
      userDataResult: {
        previousValue: null,
        currentValue: USER_DATA_RESULT,
        firstChange: true,
        isFirstChange() {
          return true;
        },
      },
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show user data', done => {
    setTimeout(() => {
      fixture.detectChanges();

      // assert
      const result = Object.values(USER_DATA_RESULT.data);
      const info = fixture.debugElement.queryAll(By.css('mat-card-subtitle'));

      const name = fixture.debugElement.query(By.css('mat-card-title')).nativeElement.innerHTML as string;
      const words = name.split(' ');

      for (const el of words) {
        const findRes = result.find(r => {
          return r === el;
        });
        expect(findRes).toBe(el);
      }

      for (const el of info) {
        const elem = el.nativeElement as HTMLElement;
        if (elem.innerHTML === 'Username: evgentrigub') {
          elem.innerHTML = 'evgentrigub';
        }
        const res = result.find(r => {
          return r === elem.innerHTML;
        });
        expect(res).toBe(elem.innerHTML);
      }

      done();
    }, 0);
  });

  it('should change view to edit mode: show inputs with user data', done => {
    setTimeout(() => {
      fixture.detectChanges();

      // arrange
      const result = Object.values(USER_DATA_RESULT.data);

      const buttonEdit = fixture.debugElement.query(By.css('button.edit')).nativeElement as HTMLButtonElement;
      expect(buttonEdit).toBeTruthy();

      // act
      buttonEdit.click();
      fixture.detectChanges();

      const inputs = fixture.debugElement.queryAll(By.css('input'));

      // assert
      for (const el of inputs) {
        const input = el.nativeElement as HTMLInputElement;
        const res = result.find(r => {
          return r === input.value;
        });
        expect(res).toBe(input.value);
      }
      expect(component.editMode).toBeTruthy();
      component.previosUserDataState.id = USER_DATA_RESULT.data.id;
      expect(component.previosUserDataState).toEqual(USER_DATA_RESULT.data);
      expect(inputs.length).toBe(5);

      done();
    }, 0);
  });

  it('should reset all changes in edit mode and hide inputs', done => {
    setTimeout(() => {
      fixture.detectChanges();

      // arrange
      const buttonEdit = fixture.debugElement.query(By.css('button.edit')).nativeElement as HTMLButtonElement;
      expect(buttonEdit).toBeTruthy();

      // act
      buttonEdit.click();
      fixture.detectChanges();

      const inputName = fixture.debugElement.queryAll(By.css('input'))[0].nativeElement as HTMLInputElement;
      inputName.value = 'aaaa';
      inputName.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(inputName.value).toBe('aaaa');

      const buttonCancel = fixture.debugElement.query(By.css('button.cancel')).nativeElement as HTMLButtonElement;
      buttonCancel.click();
      fixture.detectChanges();

      // assert
      expect(inputName.value).toBe(USER_DATA_RESULT.data.firstName);
      done();
    }, 0);
  });

  it('should check validation for updating user data', done => {
    setTimeout(() => {
      fixture.detectChanges();

      // arrange
      const buttonEdit = fixture.debugElement.query(By.css('button.edit')).nativeElement as HTMLButtonElement;
      expect(buttonEdit).toBeTruthy();

      // act
      buttonEdit.click();
      fixture.detectChanges();

      const buttonSave = fixture.debugElement.query(By.css('button.save')).nativeElement as HTMLButtonElement;

      // assert
      expect(buttonSave).toBeTruthy();
      expect(buttonSave.disabled).toBeTruthy();
      expect(component.userFormGroup.dirty).toBeFalsy();

      // act
      const inputName = fixture.debugElement.queryAll(By.css('input'))[0].nativeElement as HTMLInputElement;
      inputName.value = 'aaaa';
      inputName.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // assert
      expect(inputName.value).toBe('aaaa');
      expect(buttonSave.disabled).toBeFalsy();
      expect(component.userFormGroup.dirty).toBeTruthy();

      done();
    }, 0);
  });
});

const USER_DATA_RESULT: Result<UserData> = {
  message: '',
  isSuccess: true,
  data: {
    id: 'id',
    firstName: 'Eugene',
    lastName: 'Trigubov',
    username: 'evgentrigub',
    city: 'NY',
    position: 'dev',
  },
};
