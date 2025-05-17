import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { CsrftokenService } from '@services/csrftoken.service';
import { catchError, of, switchMap, tap } from 'rxjs';

export const csrftokenGuard: CanActivateFn = (route, state) => {
  const csrfService = inject(CsrftokenService);
  const router = inject(Router);

  if (csrfService.getToken()) return of(true);

  return csrfService.fetchCsrfToken().pipe(
    tap(() => console.log('Token set in guard')),
    switchMap(() => of(true)),
    catchError(() => {
      console.error('Failed to fetch CSRF token');
      router.navigate(['/internal-server-error'])
      return of(false);
    })
  );
};
