import { Injectable, signal, WritableSignal } from '@angular/core';
import { User } from '@models/User.model';
import { TokenService } from './token.service';
import { environment } from '@environment/environment';
import { HttpClient } from '@angular/common/http';
import { AuthResponse } from '@models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  apiUrl: string = environment.API_URL;
  user: WritableSignal<User | undefined> = signal<User | undefined>(undefined);
  userLoaded: boolean = false;

  constructor(
    private tokenService: TokenService,
    private http: HttpClient
  ) { 
    this.getUserInfo();
  }

  getUserInfo() {
    if (!this.user()) {
      this.http.get<AuthResponse>(`${this.apiUrl}/api/user/retrieve/`, { withCredentials: true })
        .subscribe({
          next: (response) => {
            this.user.set(response.User);
            this.userLoaded = true;
          },
          error: (err) => {
            console.warn('No se pudo cargar el usuario: ', err.error.message);
          }
        });
    }
  }
}
