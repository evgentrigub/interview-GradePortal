import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { SkillViewModel } from 'src/app/_models/skill-view-model';
import { environment } from 'src/environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { SkillToSend } from 'src/app/_models/skill-to-send';

const emptySkills: Observable<SkillViewModel[]> = of([]);

@Injectable({
  providedIn: 'root',
})
export class SkillService {
  constructor(private http: HttpClient) { }

  // getUserSkills(id: string): Observable<SkillViewModel[]> {
  //   return this.http.get<SkillViewModel[]>(`${environment.apiUrl}/skills/GetUserSkills/?userId=${id}`).pipe(
  //     tap(res => {
  //       for (const element of res) {
  //         element.averageAssessment = 0;
  //       }
  //     })
  //   );
  // const skills = [
  //   { id: 'aaaaa', name: 'Back-end', description: 'bbbbbbbbbbbbbbbb' },
  //   { id: 'aaaaa', name: 'Print', description: 'cccccccccccc' },
  // ] as SkillViewModel[];
  // return of(skills);
  // }

  addOrCreateSkill(userId: string, skill: SkillToSend): Observable<SkillViewModel> {
    // return of({ id: '1234', name: skill.name, description: skill.description } as Skill);
    return this.http.post<SkillViewModel>(`${environment.apiUrl}/skills/CreateOrAddSkill/${userId}`, skill)
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

    // const skills = [
    //   { id: 'dddddddd', name: 'Front-end', description: 'aaaaaaaaaaaaaaa' },
    //   { id: 'cccccccc', name: 'Front-end 2', description: 'dddddddddddd' },
    // ] as SkillViewModel[];
    // return of(skills);

    const params: HttpParams = new HttpParams({ fromObject: { query, limit: '10' } });

    return this.http.get<SkillViewModel[]>(`${environment.apiUrl}/skills/search`, { params }).pipe(
      catchError(this.handleError),
      tap(x => console.log('autocompleSkill result:', x))
    );
  }

  private handleError(error: HttpErrorResponse) {
    let msg: string;

    if (error.error instanceof ErrorEvent) {
      msg = 'Произошла ошибка:' + error.error.message;
    } else {
      msg = `Произошла ошибка: ${error.error}. Код ошибки ${error.status}`;
    }

    console.error('PositionService::handleError() ' + msg);

    return throwError(msg);
  }
}
