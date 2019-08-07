import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { User } from 'src/app/_models/user';
import { environment } from 'src/environments/environment';
import { throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { UserViewModel } from 'src/app/_models/user-view-model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<UserViewModel[]>(`${environment.apiUrl}/users/getall`).pipe(
      tap(users => {
        for (let i = 0; i < users.length; i++) {
          const user = users[i];
          user.num = i + 1;
          user.city = user.city ? user.city : 'Not Filled';
          user.position = user.position ? user.position : 'Not Filled';
        }
      })
    );
  }

  getById(id: number) {
    return this.http.get(`${environment.apiUrl}/users/get/${id}`).pipe(catchError(this.handleError));
  }

  update(user: User) {
    return this.http.put(`${environment.apiUrl}/users/update/${user.id}`, user).pipe(catchError(this.handleError));
  }

  delete(id: number) {
    return this.http.delete(`${environment.apiUrl}/users/delete/${id}`).pipe(catchError(this.handleError));
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
