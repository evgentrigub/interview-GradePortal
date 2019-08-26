import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { SearchGroup } from '../_enums/search-group-enum';
import { ISearchOptions } from '../_models/search-options';
import { UserData, UserDataTable } from '../_models/user-view-model';
import { Result } from '../_models/result-model';
import { CustomErrorResponse } from '../_models/custom-error-response';

const emptySkills: Observable<Array<string>> = of([]);

@Injectable({
  providedIn: 'root',
})
export class SearchPanelService {
  private searchUrl = `${environment.apiUrl}/search/`;

  constructor(private http: HttpClient) {}

  searchAnyParams(queryString: string, group: SearchGroup): Observable<Array<string>> {
    if (!queryString) {
      return emptySkills;
    }

    const query = queryString.trim();

    if (query.length < 3) {
      return emptySkills;
    }

    const params: HttpParams = new HttpParams({ fromObject: { query, group: group.toString() } });

    return this.http.get<Array<string>>(this.searchUrl + `paramSearch`, { params }).pipe(
      catchError(this.handleError),
      tap(x => console.log('autocompleSkill result:', x))
    );
  }

  getFilteredUsers(options: ISearchOptions): Observable<Result<UserDataTable>> {
    return this.http
      .get<Result<UserDataTable>>(this.searchUrl + `usersSearch/`, { params: new HttpParams({ fromString: options.toQueryString() }) })
      .pipe(
        catchError(this.handleError),
        tap(result => {
          const data = result.data;
          for (let i = 0; i < data.items.length; i++) {
            const user = data.items[i];
            user.num = i + 1;
            user.city = user.city ? user.city : 'No city';
            user.position = user.position ? user.position : 'No position';
          }
        })
      );
  }

  private handleError(error: CustomErrorResponse) {
    let msg: string;
    msg = error.message + ` Status Code: ${error.status}`;

    console.error('SearchPanelService::handleError() ' + msg);
    return throwError('Error: ' + msg);
  }
}
