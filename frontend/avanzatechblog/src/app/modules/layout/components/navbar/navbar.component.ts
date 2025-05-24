import { Component, inject, signal, WritableSignal } from '@angular/core';
import { UserService } from '@services/user.service';
import { Router, RouterLinkWithHref } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { RequestStatus } from '@models/request-status.models';
import { LoadingAnimationComponent } from '@modules/shared/components/loading-animation/loading-animation.component';
import { AlertComponent } from '@modules/shared/components/alert/alert.component';

@Component({
  selector: 'app-navbar',
  imports: [RouterLinkWithHref, LoadingAnimationComponent, AlertComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  status: WritableSignal<RequestStatus> = signal<RequestStatus>('init');
  menu = signal<boolean>(false);
  user = inject(UserService).user;
  message: WritableSignal<string[]> = signal<string[]>([]);

  alert: boolean = false;

  alertTitle = 'Are you sure you want to log out?'

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  toggleMenu() {
    this.menu.update(open => !open);
  }

  toggleAlert(){
    this.alert = !this.alert;
  }

  logout() {
    this.status.set('loading');
    this.authService.logout()
      .subscribe({
        next: (response) => {
          this.status.set('success');
          this.user.set(undefined);
          localStorage.removeItem('user');
          this.alert = false;
          this.router.navigate(['/'])
        },
        error: (err) => {
          this.status.set('failed');
          if (err.status === 0) {
            this.message.set(['Internal Server Error. Cannot connect to server.']);
          } else {
            for (const key in err.error) {
              if (err.error.hasOwnProperty(key)) {
                this.message.update(items => [...items, err.error[key]]);
              }
            }
          }
          if (err.status === 403) {
            this.user.set(undefined);
            localStorage.removeItem('user');
            this.router.navigate(['/'])
          }
        }
      });
  }
}
