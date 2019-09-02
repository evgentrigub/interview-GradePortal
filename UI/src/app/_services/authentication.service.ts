import { Injectable } from '@angular/core';
import { User, UserAuthenticated } from '../_models/user';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { CustomErrorResponse } from '../_models/custom-error-response';
import { Result } from '../_models/result-model';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authUrl = `${environment.apiUrl}/users/`;

  public currentUserSubject: BehaviorSubject<UserAuthenticated>;
  public currentUser: Observable<UserAuthenticated>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<UserAuthenticated>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): UserAuthenticated {
    return this.currentUserSubject.value;
  }

  /**
   * Send user login and password
   * and return authenticate user
   * @param username user login
   * @param password user password
   */
  login(username: string, password: string): Observable<Result<UserAuthenticated>> {
    return this.http.post<Result<UserAuthenticated>>(this.authUrl + `authenticate`, { username, password }).pipe(
      map(result => {
        if (result.isSuccess && result.data.token) {
          localStorage.setItem('currentUser', JSON.stringify(result.data));
          this.currentUserSubject.next(result.data);
        }
        return result;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Send user model for registration
   * and return authnticated user
   * @param user user model
   */
  register(user: User): Observable<Result<UserAuthenticated>> {
    return this.http.post<Result<UserAuthenticated>>(this.authUrl + `register`, user).pipe(catchError(this.handleError));
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  private handleError(error: CustomErrorResponse) {
    const msg = error.message + ` Status Code: ${error.status}`;
    console.error('AuthenticationService::handleError() ' + msg);
    return throwError('Error: ' + msg);
  }
}
