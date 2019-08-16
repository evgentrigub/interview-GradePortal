import { of } from 'rxjs';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatTableModule,
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { SkillViewModel } from '../_models/skill-view-model';
import { UserData } from '../_models/user-view-model';
import { SkillService } from '../_services/skill.service';
import { UserService } from '../_services/user.service';
import { PersonalPageComponent } from './personal-page.component';

// tslint:disable: no-use-before-declare
describe('PersonalPageComponent', () => {
  let component: PersonalPageComponent;
  let fixture: ComponentFixture<PersonalPageComponent>;
  let userService: UserService;
  let skillService: SkillService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PersonalPageComponent],
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
    userService = TestBed.get(UserService);
    skillService = TestBed.get(SkillService);
    spyOn(userService, 'getByUsername').and.returnValue(of(USER_DATA));
    spyOn(skillService, 'getUserSkills').and.returnValue(of(USER_SKILLS));

    fixture = TestBed.createComponent(PersonalPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

const USER_DATA: UserData = {
  num: 0,
  id: '1',
  firstName: 'Evgen',
  lastName: 'Trigubov',
  username: 'evgentrigub',
  city: 'Zelek',
  position: 'Dev',
};

const USER_SKILLS: SkillViewModel[] = [
  {
    id: '1',
    name: 'My skill',
    description: "Very long skill's descriptions",
    averageEvaluate: 0,
    expertEvaluate: 0,
  },
];
