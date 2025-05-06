import { Component, inject, signal } from '@angular/core';
import { UserService } from '@services/user.service';
import { RouterLinkWithHref } from '@angular/router';
import { AuthService } from '@services/auth.service';


@Component({
  selector: 'app-navbar',
  imports: [RouterLinkWithHref],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  menu = signal<boolean>(false);
  user = inject(UserService).user;
  
  constructor(
    private authService: AuthService
  ){}

  toggleMenu(){
    this.menu.update(open => !open);
  }

  logout(){
    this.authService.logout();
  }
}
