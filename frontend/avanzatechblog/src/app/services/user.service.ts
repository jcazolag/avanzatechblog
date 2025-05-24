import { Injectable, signal, WritableSignal } from '@angular/core';
import { User } from '@models/User.model';
import { environment } from '@environment/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  apiUrl: string = environment.API_URL;
  user: WritableSignal<User | undefined> = signal<User | undefined>(undefined);

  constructor(
    private http: HttpClient
  ) {
    this.getUserInfo();
  }

  isUserLogged() {
    this.http.get<User>(`${this.apiUrl}/api/user/me`)
      .subscribe({
        next: (response) => {
          this.user.set(response);
          localStorage.setItem('user', JSON.stringify(response));
        },
        error: (err) => {
          if (err.status === 403) {
            localStorage.removeItem('user');
            this.user.set(undefined);
          } else if (err.status === 0) {
            alert('Internal Server Error. Cannot connect to server.');
          }
        }
      })
  }

  getUserInfo() {
    if (!this.user()) {
      const user = localStorage.getItem('user');
      if (user) {
        const obj: User = JSON.parse(user)
        this.user.set(obj);
      }
    }
  }
}
