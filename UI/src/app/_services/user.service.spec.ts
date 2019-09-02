import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { UserData } from '../_models/user-view-model';

// tslint:disable: no-use-before-declare

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const usersUrl = `${environment.apiUrl}/users/`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService],
      imports: [HttpClientTestingModule],
    });

    service = TestBed.get(UserService);
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getUsersWithParams() with http.get()', () => {
    // arrange
    const pageNum = 0;
    const pageSize = 3;
    const URL = usersUrl + `getUsers?page=${pageNum}&pageSize=${pageSize}`;

    // act
    service.getUsersWithParams(pageNum, pageSize).subscribe();

    // assert
    const req = httpMock.expectOne(URL);
    expect(req.request.method).toBe('GET');
  });

  it('should call getByUsername with http.get()', () => {
    // arrange
    const username = 'evgen';
    const URL = usersUrl + `GetUser/${username}`;

    // act
    service.getByUsername(username).subscribe();

    // assert
    const req = httpMock.expectOne(URL);
    expect(req.request.method).toEqual('GET');
  });

  it('should call update with http.put() and body', () => {
    // arrange
    const URL = usersUrl + `update/${USER.id}`;

    // act
    service.update(USER).subscribe();

    // assert
    const req = httpMock.expectOne(URL);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(USER);
  });

  it('should call delete with http.delete()', () => {
    // arrange
    const URL = usersUrl + `delete/${USER.id}`;

    // act
    service.delete(USER.id).subscribe();

    // assert
    const req = httpMock.expectOne(URL);
    expect(req.request.method).toBe('DELETE');
  });
});

const USER: UserData = {
  num: 0,
  id: 'id',
  firstName: 'Eugene',
  lastName: 'Trigubov',
  username: 'evgentrigub',
  city: 'NY',
  position: 'dev',
};
