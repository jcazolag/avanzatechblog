import { Injectable, signal, WritableSignal } from '@angular/core';
import { User } from '@models/User.model';
import { environment } from '@environment/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  apiUrl: string = environment.API_URL;
  user: WritableSignal<User | undefined> = signal<User | undefined>(undefined);

  constructor() { 
    this.getUserInfo();
  }

  getUserInfo() {
    if (!this.user()) {
      const user = localStorage.getItem('user');
      if(user){
        const obj: User = JSON.parse(user)
        this.user.set(obj);
        return;
      }

      /*
      this.http.get<AuthResponse>(`${this.apiUrl}/api/user/me/`, { withCredentials: true })
        .subscribe({
          next: (response) => {
            this.user.set(response.User);
          },
          error: (err) => {
            console.warn('No se pudo cargar el usuario: ', err.error.message);
          }
        });
        */
    }
  }
}
