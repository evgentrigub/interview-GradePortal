import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { throwError, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { UserData, UserDataTable } from 'src/app/_models/user-view-model';
import { Result, ResultMessage } from '../_models/result-model';
import { CustomErrorResponse } from '../_models/custom-error-response';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private usersUrl = `${environment.apiUrl}/users/`;

  constructor(private http: HttpClient) { }

  /**
   * Return users for one page in table
   * @param pageNum page number
   * @param pageSizeNum page size
   */
  getUsersWithParams(pageNum: number, pageSizeNum: number): Observable<Result<UserDataTable>> {
    const page = pageNum.toString();
    const pageSize = pageSizeNum.toString();
    const params = new HttpParams({ fromObject: { page, pageSize } });
    console.log(page, pageSize, params);
    return this.http.get<Result<UserDataTable>>(this.usersUrl + `getUsers`, { params }).pipe(
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

  /**
   * Return user by username
   * @param username user login
   */
  getByUsername(username: string): Observable<Result<UserData>> {
    return this.http.get<Result<UserData>>(this.usersUrl + `GetUser/${username}`).pipe(
      tap(result => {
        const user = result.data;
        user.city = user.city ? user.city : 'Not Filled';
        user.position = user.position ? user.position : 'Not Filled';
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Return update result
   * @param user user data model
   */
  update(user: UserData): Observable<ResultMessage> {
    return this.http.put<ResultMessage>(this.usersUrl + `update/${user.id}`, user).pipe(catchError(this.handleError));
  }

  /**
   * Delete user
   * @param id user Id
   */
  delete(id: string): Observable<ResultMessage> {
    return this.http.delete<ResultMessage>(this.usersUrl + `delete/${id}`).pipe(catchError(this.handleError));
  }

  private handleError(error: CustomErrorResponse) {
    let msg: string;
    msg = error.message + ` Status Code: ${error.status}`;

    console.error('UserService::handleError() ' + msg);
    return throwError('Error: ' + msg);
  }
}
