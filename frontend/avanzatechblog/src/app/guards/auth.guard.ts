import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '@environment/environment';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const http = inject(HttpClient);
  const router = inject(Router);
  const apiUrl = environment.API_URL;

  return http.get(`${apiUrl}/api/user/retrieve/`, { withCredentials: true }).pipe(
    map((user: any) => {
      // Si recibimos usuario, redirigimos
      router.navigate(['/']);
      return false;
    }),
    catchError(() => {
      // No autenticado → permitir acceso
      return of(true);
    })
  );
};
