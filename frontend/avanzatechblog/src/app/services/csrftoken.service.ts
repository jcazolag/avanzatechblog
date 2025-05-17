import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap, timeout } from 'rxjs';
import { getCookie } from 'typescript-cookie';
import { environment } from '@environment/environment';
import { timeoutDuration } from '@utils/globals';
import { Generic } from '@models/generic.model';

@Injectable({
  providedIn: 'root'
})
export class CsrftokenService {
  private csrfTokenName: string = 'csrftoken';
  private apiUrl = environment.API_URL;

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Obtiene el CSRF token desde el backend y lo guarda como cookie automáticamente.
   * @returns Observable<boolean> indicando si fue exitoso.
   */
  fetchCsrfToken(): Observable<Generic> {
    return this.http.get<Generic>(`${this.apiUrl}/api/get_csfr/`, { withCredentials: true })
    .pipe(
      timeout(timeoutDuration),
      tap((response) => {
        console.log('CSRF token fetched');
      })
    );
  }

  /**
   * Devuelve el CSRF token actual desde las cookies.
   */
  getToken(): string | null {
    return getCookie(this.csrfTokenName) || null;
  }
}
