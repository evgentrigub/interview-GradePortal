import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { User } from 'src/app/_models/user';
import { environment } from 'src/environments/environment';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { UserViewModel } from 'src/app/_models/user-view-model';
import { SkillToSend } from 'src/app/_models/skill-to-send';
import { Skill } from 'src/app/_models/skill';

const emptySkills: Observable<Skill[]> = of([]);
const positionsSearchUrl = `${environment.apiUrl}/Search/`;

@Injectable({
  providedIn: 'root',
})

export class UserService {

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<UserViewModel[]>(`${environment.apiUrl}/users/getall`)
      .pipe(tap(users => {
        for (let i = 0; i < users.length; i++) {
          const user = users[i];
          user.num = i + 1;
          user.city = user.city ? user.city : "Not Filled";
          user.position = user.position ? user.position : "Not Filled";
        }
      }));
  }

  getById(id: number) {
    return this.http.get(`${environment.apiUrl}/users/get/${id}`);
  }

  update(user: User) {
    return this.http.put(`${environment.apiUrl}/users/update/${user.id}`, user);
  }

  delete(id: number) {
    return this.http.delete(`${environment.apiUrl}/users/delete/${id}`);
  }

  getUserSkills(id: string): Observable<Skill[]> {
    // return this.http.get<Skill[]>(`${environment.apiUrl}`);
    const skills = [{ name: 'Back-end', description: 'bbbbbbbbbbbbbbbb' }, { name: 'Print', description: 'cccccccccccc' }] as Skill[];
    return of(skills)
  }

  addUserSkill(userId: number, skill: SkillToSend): Observable<null> {
    return this.http.put<null>(`${environment.apiUrl}/users/addUserSkill/${userId}`, skill);
  }

  /**
   * Получить список должностей подходящих под запрос
   * @param skillQuery запрос автоподстановки должности
   */
  getAutocompleteSkills(): Observable<Skill[]> {
    // console.log("TCL: UserService -> constructor -> skillQuery", skillQuery)
    // if (!skillQuery) {
    //   return emptySkills;
    // }

    // const query = skillQuery.trim();
    // console.log(query);

    // if (query.length < 3) {
    //   return emptySkills;
    // }

    const skills = [{ name: 'Front-end', description: 'aaaaaaaaaaaaaaa' }, { name: 'Office', description: 'dddddddddddd' }] as Skill[];
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
