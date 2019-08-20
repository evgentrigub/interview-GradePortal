import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { SearchGroup } from '../_enums/search-group-enum';
import { ISearchOptions } from '../_models/search-options';
import { UserData, UserDataTable } from '../_models/user-view-model';

const emptySkills: Observable<Array<string>> = of([]);

@Injectable({
  providedIn: 'root',
})
export class SearchPanelService {
  constructor(private http: HttpClient) { }

  searchSomething(queryString: string, group: SearchGroup): Observable<Array<string>> {
    if (!queryString) {
      return emptySkills;
    }

    const query = queryString.trim();

    if (query.length < 3) {
      return emptySkills;
    }

    const params: HttpParams = new HttpParams({ fromObject: { query, group: group.toString() } });

    return this.http.get<Array<string>>(`${environment.apiUrl}/search/paramSearch`, { params }).pipe(
      catchError(this.handleError),
      tap(x => console.log('autocompleSkill result:', x))
    );
  }

  getFilteredUsers(options: ISearchOptions): Observable<UserDataTable> {
    return this.http.get<UserDataTable>(`${environment.apiUrl}/search/usersSearch/`,
      { params: new HttpParams({ fromString: options.toQueryString() }) })
      .pipe(
        catchError(this.handleError),
        tap(data => {
          for (let i = 0; i < data.items.length; i++) {
            const user = data.items[i];
            user.num = i + 1;
            user.city = user.city ? user.city : 'No city';
            user.position = user.position ? user.position : 'No position';
          }
        }));
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
