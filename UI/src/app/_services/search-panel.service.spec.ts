import { TestBed } from '@angular/core/testing';

import { SearchPanelService } from './search-panel.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';

describe('SearchPanelService', () => {
  let service: SearchPanelService;
  let httpMock: HttpTestingController;
  const searchUrl = `${environment.apiUrl}/search/`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchPanelService],
      imports: [HttpClientTestingModule],
    });

    service = TestBed.get(SearchPanelService);
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getSearchParams() with http.get()', () => {
    // arrange
    const query = 'username';
    const group = 1;
    const URL = searchUrl + `paramSearch?query=${query}&group=${group}`;

    // act
    service.getSearchParams(query, group).subscribe();

    // assert
    const req = httpMock.expectOne(URL);
    expect(req.request.method).toBe('GET');
  });

  // it('should call getFilteredUsers() with http.get()', () => {
  //   // arrange

  //   // act

  //   // assert

  // });
});
