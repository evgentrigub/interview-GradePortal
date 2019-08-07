import { Injectable } from '@angular/core';
import { User } from '../../_models/user';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string) {
    return this.http.post<any>(`${environment.apiUrl}/users/authenticate`, { username, password }).pipe(
      map(user => {
        if (user && user.token) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
        return user;
      }),
      catchError(this.handleError)
    );
  }

  register(user: User) {
    return this.http.post(`${environment.apiUrl}/users/register`, user);
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
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
