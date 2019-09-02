import { TestBed, inject } from '@angular/core/testing';

import { AuthenticationService } from './authentication.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { UserAuthenticated, User } from '../_models/user';

// tslint:disable: no-use-before-declare

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpMock: HttpTestingController;
  const authUrl = `${environment.apiUrl}/users/`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthenticationService],
      imports: [HttpClientTestingModule],
    });

    service = TestBed.get(AuthenticationService);
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call login() with http.post() and body', () => {
    // arrange
    const username = 'username';
    const password = 'password';
    const URL = authUrl + `authenticate`;

    // act
    service.login(username, password).subscribe();

    // assert
    const req = httpMock.expectOne(URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username, password });
  });

  it('should call register() with http.post() and body', () => {
    // arrange
    const URL = authUrl + `register`;

    // act
    service.register(USER).subscribe();

    // assert
    const req = httpMock.expectOne(URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(USER);
  });

  it('should logout and clear localStorage', () => {
    // arrange
    const key = 'currentUser';
    const value = JSON.stringify(USER_AUTH);

    // act
    localStorage.setItem(key, value);
    const user = localStorage.getItem(key);
    expect(user).toEqual(value);
    service.logout();

    // assert
    const item = localStorage.getItem(key);
    expect(item).toBeNull();
  });
});

const USER: User = {
  id: 'id',
  firstName: 'Eugene',
  lastName: 'Trigubov',
  username: 'evgentrigub',
  password: 'password',
  token: 'aaaaaaaaaaaaaa',
};

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
