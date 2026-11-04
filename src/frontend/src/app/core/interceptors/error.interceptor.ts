import { HttpInterceptorFn, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, throwError, switchMap, Observable, from } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        return from(auth.refreshToken()).pipe(
          switchMap(refreshed => {
            if (refreshed) {
              const newToken = auth.getAuthorizationHeader();
              if (newToken) {
                const retryReq = req.clone({ setHeaders: { Authorization: newToken } });
                return next(retryReq);
              }
            }
            auth.logout();
            router.navigate(['/auth/login']);
            return throwError(() => err);
          })
        );
      }

      if (err.status === 403) {
        router.navigate(['/'], { queryParams: { error: 'forbidden' } });
      }

      if (err.status === 0) {
        console.error('Network error:', err);
      }

      return throwError(() => err);
    })
  ) as Observable<HttpEvent<unknown>>;
};