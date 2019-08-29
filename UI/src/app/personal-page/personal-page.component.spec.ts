import { of } from 'rxjs';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { SkillViewModel } from '../_models/skill-view-model';
import { UserData } from '../_models/user-view-model';
import { SkillService } from '../_services/skill.service';
import { UserService } from '../_services/user.service';
import { PersonalPageComponent } from './personal-page.component';
import { SkillsTableComponent } from './skills-table/skills-table.component';
import { UserDataComponent } from './user-data/user-data.component';
import { MaterialModule } from '../material-module';
import { ThrowStmt } from '@angular/compiler';
import { UserAuthenticated } from '../_models/user';
import { Result } from '../_models/result-model';

// tslint:disable: no-use-before-declare
describe('PersonalPageComponent', () => {
  let component: PersonalPageComponent;
  let fixture: ComponentFixture<PersonalPageComponent>;
  let userService: UserService;
  let skillService: SkillService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PersonalPageComponent, SkillsTableComponent, UserDataComponent],
      imports: [BrowserAnimationsModule, HttpClientTestingModule, ReactiveFormsModule, RouterTestingModule, MaterialModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    userService = TestBed.get(UserService);
    skillService = TestBed.get(SkillService);
    spyOn(skillService, 'getUserSkills').and.returnValue(of(USER_SKILLS));

    fixture = TestBed.createComponent(PersonalPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return user data', (done) => {
    // arrange
    component.currentUser = USER_AUTH;
    component.routeUsername = USER_AUTH.username;

    spyOn(userService, 'getByUsername').and.returnValue(of(USER_DATA_RESULT)).and.callThrough();

    fixture.detectChanges();

    setTimeout(() => {
      console.log('userdata', component.userData)

      expect(component.userData).toEqual(USER_DATA_RESULT)
      done();
    }, 1000);
  });

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

const USER_SKILLS: SkillViewModel[] = [
  {
    id: '1',
    name: 'My skill',
    description: "Very long skill's descriptions",
    averageEvaluate: 0,
    expertEvaluate: 0,
  },
];

const USER_AUTH: UserAuthenticated = {
  num: 0,
  id: 'id',
  firstName: 'Eugene',
  lastName: 'Trigubov',
  username: 'evgentrigub',
  city: 'NY',
  position: 'dev',
  token: 'aaaaaaaaaaaaaa'
};

