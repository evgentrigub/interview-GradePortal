import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { SearchGroup } from '../_enums/search-group-enum';
import { ISearchOptions } from '../_models/search-options';
import { UserDataTable } from '../_models/user-view-model';
import { Result } from '../_models/result-model';
import { CustomErrorResponse } from '../_models/custom-error-response';

const emptySkills: Observable<Array<string>> = of([]);

@Injectable({
  providedIn: 'root',
})
export class SearchPanelService {
  private searchUrl = `${environment.apiUrl}/search/`;

  constructor(private http: HttpClient) { }

  /**
   * Return possible search options in search panel
   * @param queryString search query
   * @param group group number: city, position or skill
   */
  getSearchParams(queryString: string, group: SearchGroup): Observable<Array<string>> {
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

  /**
   * Return filtered users with params
   * @param options include page num, page size and options: city, position or skill
   */
  getFilteredUsers(options: ISearchOptions): Observable<Result<UserDataTable>> {
    return this.http
      .get<Result<UserDataTable>>(this.searchUrl + `usersSearch/`, { params: new HttpParams({ fromString: options.toQueryString() }) })
      .pipe(
        catchError(this.handleError),
        tap(result => {
          const data = result.data;
          for (let i = 0; i < data.items.length; i++) {
            const user = data.items[i];
            user.num = (i + 1) + options.pageIndex * options.pageSize;
            user.city = user.city ? user.city : 'No city';
            user.position = user.position ? user.position : 'No position';
          }
        })
      );
  }

  private handleError(error: CustomErrorResponse) {
    const msg = error.message + ` Status Code: ${error.status}`;
    console.error('SearchPanelService::handleError() ' + msg);
    return throwError('Error: ' + msg);
  }
}
