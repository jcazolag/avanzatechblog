import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CustomValidators } from '@utils/validators';
import { RequestStatus } from '@models/request-status.models';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-form',
  imports: [ReactiveFormsModule],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.css'
})
export class RegisterFormComponent {
  form: FormGroup;

  status: RequestStatus = 'init';
  message = signal<string>('');
  
  constructor( 
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ){
    this.form = this.formBuilder.group(
      {
        email: ['', [Validators.email, Validators.required]],
        password: ['', [Validators.minLength(4) ,Validators.required], Validators.maxLength(128)],
        confirmPassword: ['', Validators.required]
      }, {
        validators: [CustomValidators.MatchValidator('password', 'confirmPassword')]
      }
    );
  }

  register() {
    if (this.form.valid) {
      this.status = 'loading';
      const { email, password } = this.form.getRawValue();
      this.authService.register( email, password )
      .subscribe({
        next: (response) => {
          this.status = 'success';
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.status = 'failed';
          if (err.status === 401) {
            this.message.set('Invalid email or password.');
          }else if(err.status === 403){
            this.message.set(err.error.message);
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
