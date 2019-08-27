import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { SkillViewModel } from 'src/app/_models/skill-view-model';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs/operators';
import { SkillToSend } from 'src/app/_models/skill-to-send';
import { EvaluationToSend } from 'src/app/_models/evaluation-to-send';
import { Result, ResultMessage } from '../_models/result-model';
import { CustomErrorResponse } from '../_models/custom-error-response';

const emptySkills: Observable<SkillViewModel[]> = of([]);

@Injectable({
  providedIn: 'root',
})
export class SkillService {
  private skillsUrl = `${environment.apiUrl}/skills/`;

  constructor(private http: HttpClient) { }

  /**
   * Return array of user skills
   * @param userId Id of page owner
   * @param expertId Id of authenticated user (optional)
   */
  getUserSkills(userId: string, expertId?: string): Observable<Result<SkillViewModel[]>> {
    return this.http
      .get<Result<SkillViewModel[]>>(`${environment.apiUrl}/skills/GetSkills/${userId}?expertId=${expertId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Send user skill and add to user skill collection, if skill existsted.
   * If skill is new, create skill and then add to user skill collection.
   * @param userId Id of page owner
   * @param skill skill model
   */
  addOrCreateSkill(userId: string, skill: SkillToSend): Observable<SkillViewModel> {
    return this.http.post<SkillViewModel>(this.skillsUrl + `CreateOrAddSkill/${userId}`, skill).pipe(catchError(this.handleError));
  }

  /**
   * Return possible skill options
   * @param skillQuery search query
   */
  getAutocompleteSkills(skillQuery: string): Observable<SkillViewModel[]> {
    if (!skillQuery) {
      return emptySkills;
    }

    const query = skillQuery.trim();

    if (query.length < 3) {
      return emptySkills;
    }

    const params: HttpParams = new HttpParams({ fromObject: { query, limit: '10' } });

    return this.http.get<SkillViewModel[]>(`${environment.apiUrl}/search/searchSkills`, { params }).pipe(
      catchError(this.handleError)
      // tap(x => console.log('autocompleSkill result:', x))
    );
  }

  /**
   * Create new skill evaluatiuon
   * @param evaluation evaluation model
   */
  addEvaluation(evaluation: EvaluationToSend): Observable<ResultMessage> {
    return this.http.post<ResultMessage>(`${environment.apiUrl}/evaluations/create`, evaluation)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: CustomErrorResponse) {
    const msg = error.message + ` Status Code: ${error.status}`;
    console.error('SkillService::handleError() ' + msg);
    return throwError('Error: ' + msg);
  }
}
