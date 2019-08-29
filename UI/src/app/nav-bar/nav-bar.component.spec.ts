import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { Location } from '@angular/common';
import { NavBarComponent } from './nav-bar.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UserAuthenticated } from '../_models/user';
import { By } from '@angular/platform-browser';
import { MaterialModule } from '../material-module';
import { LoginComponent } from '../account/login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PersonalPageComponent } from '../personal-page/personal-page.component';
import { UserDataComponent } from '../personal-page/user-data/user-data.component';
import { SkillsTableComponent } from '../personal-page/skills-table/skills-table.component';

// tslint:disable: no-use-before-declare

describe('NavBarComponent', () => {
  let component: NavBarComponent;
  let fixture: ComponentFixture<NavBarComponent>;
  let location: Location;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        NavBarComponent,
        LoginComponent,
        PersonalPageComponent,
        UserDataComponent,
        SkillsTableComponent
      ],
      imports: [
        MaterialModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(
          [
            { path: 'login', component: LoginComponent },
            { path: ':username', component: PersonalPageComponent }
          ]
        )]
    }).compileComponents();
  }));

  beforeEach(() => {
    location = TestBed.get(Location);
    fixture = TestBed.createComponent(NavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should log out from account', () => {
    // arrange
    component.currentUser = userAuth;
    fixture.detectChanges();

    const buttonLogOut = fixture.debugElement.query(By.css('button.logout')).nativeElement as HTMLButtonElement;
    expect(buttonLogOut).toBeTruthy();

    // act
    buttonLogOut.dispatchEvent(new Event('click'));
    fixture.detectChanges();

    const otherbuttonLogOut = fixture.debugElement.query(By.css('button.logout'));
    // assert
    expect(otherbuttonLogOut).toBeFalsy();
  });

  it('should route to personal page, if user is authorized', fakeAsync(() => {
    // arrange
    component.currentUser = userAuth;
    fixture.detectChanges();
    const buttonAccount = fixture.debugElement.query(By.css('button.account')).nativeElement as HTMLButtonElement;
    expect(buttonAccount).toBeTruthy();

    // act
    buttonAccount.click();
    fixture.detectChanges();
    tick();

    // assert
    expect(location.path()).toBe(`/${userAuth.username}`);
  }));

  it('should route to login component, if user is not authorized', fakeAsync(() => {
    // arrange
    component.currentUser = null;
    fixture.detectChanges();
    const buttonAccount = fixture.debugElement.query(By.css('button.account')).nativeElement as HTMLButtonElement;
    expect(buttonAccount).toBeTruthy();

    // act
    buttonAccount.click();
    fixture.detectChanges();
    tick();

    // assert
    expect(location.path()).toBe('/login');
  }));

});

const userAuth: UserAuthenticated = {
  num: 0,
  id: 'id',
  firstName: 'Eugene',
  lastName: 'Trigubov',
  username: 'evgentrigub',
  city: 'NY',
  position: 'dev',
  token: 'aaaaaaaaaaaaaa'
};
