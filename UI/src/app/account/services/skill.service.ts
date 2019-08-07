import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { Skill } from 'src/app/_models/skill';

const emptySkills: Observable<Skill[]> = of([]);

@Injectable({
  providedIn: 'root',
})
export class SkillService {
  constructor(private http: HttpClient) {}

  getUserSkills(id: string): Observable<Skill[]> {
    // return this.http.get<Skill[]>(`${environment.apiUrl}/skills/getSkills/${id}`);
    const skills = [
      { id: 'aaaaa', name: 'Back-end', description: 'bbbbbbbbbbbbbbbb' },
      { id: 'aaaaa', name: 'Print', description: 'cccccccccccc' },
    ] as Skill[];
    return of(skills);
  }

  addSkillToUser(userId: string, skill: Skill): Observable<Skill> {
    return of({ id: '1234', name: skill.name, description: skill.description } as Skill);
    // return this.http.put<null>(`${environment.apiUrl}/skills/addSkillToUser/${userId}`, skill)
    //   .pipe(
    //     catchError(this.handleError),
    //     map(_ => null)
    //   );
  }

  createNewSkill(userId: string, skill: Skill): Observable<Skill> {
    return of({ id: '1234', name: skill.name, description: skill.description } as Skill);
    // return this.http.post<Skill>(`${environment.apiUrl}/skills/createSkill/${userId}`, skill)
    //   .pipe(
    //     catchError(this.handleError),
    //     tap(res => this.addSkillToUser(userId, skill))
    //   );
  }

  /**
   * Получить список должностей подходящих под запрос
   * @param skillQuery запрос автоподстановки должности
   */
  getAutocompleteSkills(skillQuery: string): Observable<Skill[]> {
    if (!skillQuery) {
      return emptySkills;
    }

    const query = skillQuery.trim();

    if (query.length < 3) {
      return emptySkills;
    }

    const skills = [
      { id: 'dddddddd', name: 'Front-end', description: 'aaaaaaaaaaaaaaa' },
      { id: 'cccccccc', name: 'Front-end 2', description: 'dddddddddddd' },
    ] as Skill[];
    return of(skills);

    // const params: HttpParams = new HttpParams({ fromObject: { query: query, limit: '10' } });

    // return this.http.get<Skill[]>(positionsSearchUrl, { params: params }).pipe(
    //   catchError(this.handleError)
    //   //, tap(x => console.log('autocomplePosition result:', x))
    // );
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
