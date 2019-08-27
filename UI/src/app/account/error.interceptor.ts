import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthenticationService } from '../_services/authentication.service';
import { CustomErrorResponse } from '../_models/custom-error-response';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthenticationService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.authenticationService.logout();
          location.reload(true);
        }

        if (err.status === 0) {
          return throwError(new CustomErrorResponse('Connection to server failed.', 0));
        }

        if (err.status === 400) {
          return throwError(new CustomErrorResponse(err.error.message, err.status));
        }

        const error = err.error.status ? err.error : new CustomErrorResponse(err.message, err.status);
        return throwError(error);
      })
    );
  }
}
