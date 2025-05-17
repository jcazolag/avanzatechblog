import { Injectable } from '@angular/core';
import { TokenService } from './token.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, timeout } from 'rxjs';

import { environment } from '@environment/environment';
import { UserService } from './user.service';
import { timeoutDuration } from '@utils/globals';
import { User } from '@models/User.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  apiUrl: string = environment.API_URL;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private userService: UserService,
  ) {  }

  login(email: string, password: string): Observable<User>{
    return this.http.post<User>(`${this.apiUrl}/api/user/login/`, {
      "email": email,
      "password": password
    }, {
      withCredentials: true,
    })
    .pipe(
      timeout(timeoutDuration),
      tap( response =>{
        this.userService.user.set(response);
        localStorage.setItem('user', JSON.stringify(response));
      })
    );
  }

  register(email: string, password: string): Observable<User>{
    return this.http.post<User>(`${this.apiUrl}/api/user/register/`, {
      "email": email,
      "password": password
    }, {
      withCredentials: true,
    }).pipe(
      timeout(timeoutDuration)
    );
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
        this.userService.user.set(undefined);
        localStorage.removeItem('user');
        window.location.reload();
      },
      error: (err) =>{
        alert("Server error. Could not logout. Try again.")
      }
    });
  }
}
