import { CanActivateFn, Router } from '@angular/router';
import { CsrftokenService } from '@services/csrftoken.service';
import { inject } from '@angular/core';
import { catchError, of, switchMap, tap } from 'rxjs';


export const notCsrfTokenGuard: CanActivateFn = (route, state) => {
  const csrfService = inject(CsrftokenService);
  const router = inject(Router);

  if (csrfService.getToken()){
    router.navigate(['/']);
    return false;
  }
  return csrfService.fetchCsrfToken().pipe(
      tap(() => {
        console.log('Token set in guard')
        router.navigate(['/']);
      }),
      switchMap(() => of(false)),
      catchError(() => {
        console.error('Failed to fetch CSRF token');
        return of(true);
      })
    );
};
