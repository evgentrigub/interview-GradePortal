import { TestBed } from '@angular/core/testing';

import { SkillService } from './skill.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { SkillToSend } from '../_models/skill-to-send';
import { EvaluationToSend } from '../_models/evaluation-to-send';

describe('SkillService', () => {
  let service: SkillService;
  let httpMock: HttpTestingController;
  const skillsUrl = `${environment.apiUrl}/skills/`;
  const searchUrl = `${environment.apiUrl}/search/`;
  const evaluationsUrl = `${environment.apiUrl}/evaluations/`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SkillService],
      imports: [HttpClientTestingModule],
    });

    service = TestBed.get(SkillService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getUserSkills() with http.get()', () => {
    // arrange
    const userId = 'id1';
    const expertId = 'id2';
    const UrlWithExpert = skillsUrl + `GetSkills/${userId}?expertId=${expertId}`;

    // act
    service.getUserSkills(userId, expertId).subscribe();

    // assert
    const reqWithExpert = httpMock.expectOne(UrlWithExpert);
    expect(reqWithExpert.request.method).toBe('GET');
  });

  it('should call addOrCreateSkill() with http.post()', () => {
    // // arrange
    const userId = 'id1';
    const skill: SkillToSend = {
      id: 'id1',
      name: 'aaaa',
      description: 'bbbb'
    }
    const URL = skillsUrl + `CreateOrAddSkill/${userId}`;

    // act
    service.addOrCreateSkill(userId, skill).subscribe();

    // assert
    const req = httpMock.expectOne(URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(skill);
  });

  it('should call getAutocompleteSkills() with http.get()', () => {
    // arrange
    const query = 'some';
    const limit = '10';
    const URL = searchUrl + `searchSkills?query=${query}&limit=${limit}`;

    // act
    service.getAutocompleteSkills(query).subscribe()

    // assert
    const req = httpMock.expectOne(URL);
    expect(req.request.method).toBe('GET');
  });

  it('should call addEvaluation() with http.post()', () => {
    // arrange
    const evaluation: EvaluationToSend = {
      userId: 'id1',
      expertId: 'id2',
      skillId: 'id3',
      value: 5
    }
    const URL = evaluationsUrl + `create`;

    // act
    service.addEvaluation(evaluation).subscribe();

    // assert
    const req = httpMock.expectOne(URL);
    expect(req.request.method).toBe('POST');

  });

});
