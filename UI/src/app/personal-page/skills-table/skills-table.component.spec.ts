import { async, ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';

import { SkillsTableComponent } from './skills-table.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material-module';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatIconModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { Result, ResultMessage } from 'src/app/_models/result-model';
import { SkillViewModel } from 'src/app/_models/skill-view-model';
import { By } from '@angular/platform-browser';
import { SkillService } from 'src/app/_services/skill.service';
import { UserAuthenticated } from 'src/app/_models/user';
import { of } from 'rxjs';

// tslint:disable: no-use-before-declare

describe('SkillsTableComponent', () => {
  let component: SkillsTableComponent;
  let fixture: ComponentFixture<SkillsTableComponent>;
  let skillService: SkillService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SkillsTableComponent],
      imports: [BrowserAnimationsModule, MaterialModule, ReactiveFormsModule, HttpClientTestingModule, MatIconModule, RouterTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    skillService = TestBed.get(SkillService);
    fixture = TestBed.createComponent(SkillsTableComponent);
    component = fixture.componentInstance;
    component.userSkillsResult = USER_SKILLS_RESULT;
    fixture.detectChanges();

    component.ngOnChanges({
      userSkillsResult: {
        previousValue: null,
        currentValue: USER_SKILLS_RESULT,
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

  describe('Authentication', () => {
    it('should show skill table with evaluated skills; disabled and add buttons; if authorized and not page owner', done => {
      // arrange

      component.displayedColumns = ['action', 'name', 'description', 'rating', 'expertValue'];
      component.pageOwner = false;
      setTimeout(() => {
        fixture.detectChanges();

        // assert
        const table = fixture.debugElement.query(By.css('table')).nativeElement as HTMLTableElement;
        const btnAdd = table.querySelector('button.add');
        expect(btnAdd).toBeNull();

        const row = fixture.nativeElement.querySelectorAll('tr')[1] as HTMLTableRowElement;
        const rowValue = row.cells[4].innerText.split(' ')[0];
        const dataValue = USER_SKILLS_RESULT.data[0].expertEvaluate.toString();
        expect(rowValue).toBe(dataValue);

        done();
      }, 0);
    });

    it('should show skill table and add-button, if authorized and pageOwner', done => {
      // arrange

      component.displayedColumns = ['action', 'name', 'description', 'rating'];
      component.pageOwner = true;

      setTimeout(() => {
        fixture.detectChanges();

        // assert
        const table = fixture.debugElement.query(By.css('table')).nativeElement as HTMLTableElement;
        const btnAdd = table.querySelector('button.add');
        expect(btnAdd).toBeTruthy();

        const row = fixture.nativeElement.querySelectorAll('tr')[1] as HTMLTableRowElement;
        const rowValue = row.cells[4];
        expect(rowValue).toBeFalsy();

        done();
      }, 0);
    });

    it('should show skill table, if not authorized', done => {
      // arrange

      component.displayedColumns = ['action', 'name', 'description', 'rating'];
      component.pageOwner = false;
      setTimeout(() => {
        fixture.detectChanges();

        // assert
        const table = fixture.debugElement.query(By.css('table')).nativeElement as HTMLTableElement;
        const btnAdd = table.querySelector('button.add');
        expect(btnAdd).toBeNull();

        const row = fixture.nativeElement.querySelectorAll('tr')[1] as HTMLTableRowElement;
        const rowValue = row.cells[4];
        expect(rowValue).toBeFalsy();

        done();
      }, 0);
    });
  });

  describe('Create Skill', () => {
    it('should change view to edit, if create new skill', done => {
      // arrange

      component.displayedColumns = ['action', 'name', 'description', 'rating'];
      component.pageOwner = true;

      setTimeout(() => {
        fixture.detectChanges();

        const table = fixture.debugElement.query(By.css('table')).nativeElement as HTMLTableElement;
        const btnAdd = table.querySelector('button.add');
        expect(btnAdd).toBeTruthy();

        // act
        btnAdd.dispatchEvent(new Event('click'));
        fixture.detectChanges();

        const inputs = table.querySelectorAll('input');
        const btnCancel = table.querySelector('button.cancel');
        const btnSave = table.querySelector('button.save');

        // assert
        expect(inputs.length).toBe(2);
        expect(btnCancel).toBeTruthy();
        expect(btnSave).toBeTruthy();

        done();
      }, 0);
    });

    it('should cancel all changes in edit mode, if create skill', done => {
      // arrange

      component.displayedColumns = ['action', 'name', 'description', 'rating'];
      component.pageOwner = true;

      setTimeout(() => {
        fixture.detectChanges();

        const table = fixture.debugElement.query(By.css('table')).nativeElement as HTMLTableElement;
        const btnAdd = table.querySelector('button.add');
        expect(btnAdd).toBeTruthy();

        // act
        btnAdd.dispatchEvent(new Event('click'));
        fixture.detectChanges();

        const input = table.querySelector('input');
        const btnCancel = table.querySelector('button.cancel');

        const val = '5';
        input.value = val;
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        // assert
        expect(input.value).toBe(val);

        // act
        btnCancel.dispatchEvent(new Event('click'));
        fixture.detectChanges();

        const inputAfterCancel = table.querySelector('input');

        // assert
        expect(inputAfterCancel).toBeNull();

        done();
      }, 0);
    });

    // TO-DO
    // it('should get skill object from autocomplete event', async () => {
    //   component.displayedColumns = ['action', 'name', 'description', 'rating'];
    //   component.pageOwner = true;
    //   spyOn(skillService, 'getAutocompleteSkills').and.returnValue(of(SEARCH_RESULT));

    //   fixture.whenStable().then(
    //     fakeAsync(() => {
    //       fixture.detectChanges();
    //       const table = fixture.debugElement.query(By.css('table')).nativeElement as HTMLTableElement;
    //       const btnAdd = table.querySelector('button.add');
    //       expect(btnAdd).toBeTruthy();

    //       btnAdd.dispatchEvent(new Event('click'));
    //       fixture.detectChanges();

    //       // jasmine.clock().install()

    //       tick(300)

    //       const input = table.querySelector('input') as HTMLInputElement;
    //       input.dispatchEvent(new Event('focusin'));
    //       input.value = 'aaa';
    //       input.dispatchEvent(new Event('input'));
    //       fixture.detectChanges()

    //       expect('').toBe('Not completed')
    //       // jasmine.clock().tick(1000);
    //       // jasmine.clock().uninstall();

    //     }));

    // });
  });

  describe('Add Evaluation', () => {
    it('should change view to edit, if evaluate skill', done => {
      // arrange

      component.displayedColumns = ['action', 'name', 'description', 'rating', 'expertValue'];
      component.pageOwner = false;
      setTimeout(() => {
        fixture.detectChanges();

        const table = fixture.debugElement.query(By.css('table')).nativeElement as HTMLTableElement;
        const btnAdd = table.querySelector('button.add-eval');

        // act
        btnAdd.dispatchEvent(new Event('click'));
        fixture.detectChanges();

        const inputs = table.querySelectorAll('input');
        const btnCancel = table.querySelector('button.cancel-eval');
        const btnSave = table.querySelector('button.save-eval');

        // assert
        expect(inputs.length).toBe(1);
        expect(btnCancel).toBeTruthy();
        expect(btnSave).toBeTruthy();

        done();
      }, 0);
    });

    it('should cancel all changes in edit mode, if evaluate skill', done => {
      // arrange

      component.displayedColumns = ['action', 'name', 'description', 'rating', 'expertValue'];
      component.pageOwner = false;
      setTimeout(() => {
        fixture.detectChanges();

        const table = fixture.debugElement.query(By.css('table')).nativeElement as HTMLTableElement;
        const btnAdd = table.querySelector('button.add-eval');

        btnAdd.dispatchEvent(new Event('click'));
        fixture.detectChanges();

        const input = table.querySelector('input') as HTMLInputElement;
        const btnCancel = table.querySelector('button.cancel-eval');

        // act
        const val = '5';
        input.value = val;
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        // assert
        expect(input.value).toBe(val);

        // act
        btnCancel.dispatchEvent(new Event('click'));
        fixture.detectChanges();

        const inputAfterCancel = table.querySelector('input');

        // assert
        expect(inputAfterCancel).toBeNull();

        done();
      }, 0);
    });

    it('should check validation for creating new evaluation', done => {
      // arrange

      component.displayedColumns = ['action', 'name', 'description', 'rating', 'expertValue'];
      component.pageOwner = false;
      setTimeout(() => {
        fixture.detectChanges();

        const table = fixture.debugElement.query(By.css('table')).nativeElement as HTMLTableElement;
        const btnAdd = table.querySelector('button.add-eval');

        // act
        btnAdd.dispatchEvent(new Event('click'));
        fixture.detectChanges();

        const input = table.querySelector('input') as HTMLInputElement;
        const btnSave = table.querySelector('button.save-eval') as HTMLButtonElement;

        // assert
        expect(btnSave.disabled).toBeTruthy();

        // act
        const val = '5';
        input.value = val;
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        // assert
        expect(input.value).toBe(val);
        expect(btnSave.disabled).toBeFalsy();

        done();
      }, 0);
    });

    it('should save new evaluation', done => {
      // arrange

      component.displayedColumns = ['action', 'name', 'description', 'rating', 'expertValue'];
      component.pageOwner = false;
      component.currentUser = USER_AUTH;
      component.userId = 'aaaa';

      spyOn(skillService, 'addEvaluation').and.returnValue(of(RESULT_MESSAGE));
      fixture.detectChanges();

      setTimeout(() => {
        fixture.detectChanges();

        const table = fixture.debugElement.query(By.css('table')).nativeElement as HTMLTableElement;
        const btnAdd = table.querySelector('button.add-eval');

        // act
        btnAdd.dispatchEvent(new Event('click'));
        fixture.detectChanges();

        const input = table.querySelector('input') as HTMLInputElement;
        const btnSave = table.querySelector('button.save-eval') as HTMLButtonElement;
        expect(btnSave.disabled).toBeTruthy();

        const val = '5';
        input.value = val;
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        btnSave.click();
        fixture.detectChanges();

        // assert
        expect(component.evaluatedSkill).toBe('');

        done();
      }, 0);
    });
  });
});

const USER_AUTH: UserAuthenticated = {
  num: 0,
  id: 'id',
  firstName: 'Eugene',
  lastName: 'Trigubov',
  username: 'evgentrigub',
  city: 'NY',
  position: 'dev',
  token: 'aaaaaaaaaaaaaa',
};

const USER_SKILLS_RESULT: Result<SkillViewModel[]> = {
  message: '',
  isSuccess: true,
  data: [
    {
      num: 0,
      id: 'id1',
      name: 'Skill one',
      description: 'Description one',
      averageEvaluate: 3.5,
      expertEvaluate: 4,
    },
    {
      num: 1,
      id: 'id2',
      name: 'Skill two',
      description: 'Description two',
      averageEvaluate: 5,
      expertEvaluate: 5,
    },
    {
      num: 2,
      id: 'id3',
      name: 'Skill three',
      description: 'Description three',
      averageEvaluate: 4.6,
      expertEvaluate: 0,
    },
  ],
};

const RESULT_MESSAGE: ResultMessage = {
  message: 'success',
  isSuccess: true,
};

const SEARCH_RESULT: SkillViewModel[] = [
  {
    num: 0,
    id: '1',
    name: 'aaaaaaaa',
    description: "Very long skill's descriptions",
    averageEvaluate: 0,
    expertEvaluate: 0,
  },
  {
    num: 1,
    id: '1',
    name: 'aaaaabbbb',
    description: "Very long skill's descriptions",
    averageEvaluate: 0,
    expertEvaluate: 0,
  },
];
