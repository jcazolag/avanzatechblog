import { Component } from '@angular/core';
import { RouterLinkWithHref } from '@angular/router';
import { LoginFormComponent } from '@modules/auth/components/login-form/login-form.component';

@Component({
  selector: 'app-login',
  imports: [LoginFormComponent, RouterLinkWithHref],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export default class LoginComponent {
  
}
