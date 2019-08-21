import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { SkillViewModel } from 'src/app/_models/skill-view-model';
import { environment } from 'src/environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { SkillToSend } from 'src/app/_models/skill-to-send';
import { EvaluationToSend } from 'src/app/_models/evaluation-to-send';

const emptySkills: Observable<SkillViewModel[]> = of([]);

@Injectable({
  providedIn: 'root',
})
export class SkillService {
  constructor(private http: HttpClient) { }

  getUserSkills(username: string, expertId?: string): Observable<SkillViewModel[]> {
    return this.http
      .get<SkillViewModel[]>(`${environment.apiUrl}/skills/GetSkills/${username}?expertId=${expertId}`)
      .pipe(catchError(this.handleError));
  }

  addOrCreateSkill(userId: string, skill: SkillToSend): Observable<SkillViewModel> {
    return this.http
      .post<SkillViewModel>(`${environment.apiUrl}/skills/CreateOrAddSkill/${userId}`, skill)
      .pipe(catchError(this.handleError));
  }

  /**
   * Получить список должностей подходящих под запрос
   * @param skillQuery запрос автоподстановки должности
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

    return this.http.get<SkillViewModel[]>(`${environment.apiUrl}/skills/search`, { params }).pipe(
      catchError(this.handleError)
      // tap(x => console.log('autocompleSkill result:', x))
    );
  }

  addEvaluation(evaluation: EvaluationToSend): Observable<null> {
    return this.http.post<null>(`${environment.apiUrl}/evaluations/create`, evaluation).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    // let msg: string;

    // if (error.error instanceof ErrorEvent) {
    //   msg = 'Произошла ошибка:' + error.error.message;
    // } else {
    //   msg = `Произошла ошибка: ${error.error}. Код ошибки ${error.status}`;
    // }

    console.error('PositionService::handleError() ' + error.message);

    return throwError('Произошла ошибка:' + error.error.message);
  }
}
