import { Component, signal, WritableSignal } from '@angular/core';
import { RegisterFormComponent } from '@modules/auth/components/register-form/register-form.component';
import { RouterLinkWithHref } from '@angular/router';
import { PageStatus } from '@models/request-status.models';

@Component({
  selector: 'app-register',
  imports: [
    RegisterFormComponent, 
    RouterLinkWithHref
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export default class RegisterComponent {

}
