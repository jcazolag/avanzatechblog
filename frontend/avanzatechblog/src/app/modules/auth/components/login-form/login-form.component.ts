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

  status: RequestStatus = 'init';
  showPassword = false;
  message = signal<string>('');

  constructor( 
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ){
    this.form = this.formBuilder.group(
      {
        email: ['', [Validators.email, Validators.required]],
        password: ['', [Validators.minLength(4) ,Validators.required]]
      }
    );
  }

  login(): any {
    if (this.form.valid) {
      this.status = 'loading';
      const { email, password } = this.form.getRawValue();
      this.authService.login( email, password )
      .subscribe({
        next: (response) => {
          this.status = 'success';
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.status = 'failed';
          if (err.status === 401) {
            this.message.set('Invalid email or password.');
          } else if (err.status === 0) {
            this.message.set('Cannot connect to server.');
          } else {
            this.message.set(`Error ${err.status}: ${err.statusText || 'Unknown error'}`);
          }
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
