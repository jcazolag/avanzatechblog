import { Component, signal } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestStatus } from '@models/request-status.models';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent {
  form: FormGroup;

  showPassword: boolean = false;
  message = signal<string>('');

  constructor( 
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ){
    this.form = this.formBuilder.group(
      {
        email: ['', [Validators.email, Validators.required]],
        password: ['', [Validators.minLength(4) ,Validators.required, Validators.maxLength(128)]]
      }
    );
  }

  togglePassword(event: Event){
    this.showPassword = !this.showPassword;
  }

  login() {
    if (this.form.valid) {
      const { email, password } = this.form.getRawValue();
      this.authService.login( email, password )
      .subscribe({
        next: (response) => {
          this.router.navigate(['/']);
          window.location.reload();
        },
        error: (err) => {
          if (err.status === 400) {
            this.message.set(err.error.message);
          }else if(err.status === 403){
            this.message.set(err.error.message);
          } else if (err.status === 0) {
            this.message.set('Cannot connect to server.');
          }else if(err.status === 409) {
            this.message.set(err.error.message)
          } else if(err.status === 401){
            this.message.set(err.error.message)
          }
          else {
            this.message.set(`Error ${err.status}: ${err.statusText || 'Unknown error'}`);
          }
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
