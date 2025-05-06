import { Injectable } from '@angular/core';
import { TokenService } from './token.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, tap } from 'rxjs';

import { environment } from '@environment/environment';
import { AuthResponse } from '@models/auth.models';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  apiUrl: string = environment.API_URL;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private userService: UserService
  ) {  }

  private csrfToken(){
    this.http.get(`${this.apiUrl}/api/get_csfr/`, {
      withCredentials: true,
    }).subscribe({
      next: (response) => {
        console.log(response)
      },
      error: (err) => {
        console.log(err)
      }
    });
  }

  login(email: string, password: string): Observable<AuthResponse>{
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/user/login/`, {
      "email": email,
      "password": password
    }, {
      withCredentials: true,
    })
    .pipe(
      tap( response =>{
        this.userService.user.set(response.User);
        this.userService.userLoaded = true;
        console.log(response.message);
      })
    );
  }

  register(email: string, password: string): Observable<Object>{
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/user/register/`, {
      "email": email,
      "password": password
    }, {
      withCredentials: true,
    });
  }

  logout(){
    const csrfToken = this.tokenService.getToken('csrftoken');
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken || '',
      'Content-Type': 'application/json',
    });
    return this.http.post(`${this.apiUrl}/api/user/logout/`, {}, { 
      headers,
      withCredentials: true,
    }).subscribe({
      next: (response) =>{
        console.log(response)
        this.userService.user.set(undefined);
      },
      error: (err) =>{
        console.log(err)
      }
    });
  }
}
