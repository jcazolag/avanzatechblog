import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CustomValidators } from '@utils/validators';
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

  message = signal<string>('');
  
  constructor( 
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ){
    this.form = this.formBuilder.group(
      {
        email: ['', [Validators.email, Validators.required]],
        password: ['', [Validators.minLength(4) ,Validators.required, Validators.maxLength(128)]],
        confirmPassword: ['', Validators.required]
      }, {
        validators: [CustomValidators.MatchValidator('password', 'confirmPassword')]
      }
    );
  }

  register() {
    if (this.form.valid) {
      const { email, password } = this.form.getRawValue();
      this.authService.register( email, password )
      .subscribe({
        next: (response) => {
          alert("User created successfuly");
          this.router.navigate(['/login', {email: response.email}]);
        },
        error: (err) => {
          if (err.status === 400) {
            this.message.set(err.error.message);
          }else if(err.status === 403){
            this.message.set(err.error.message);
          } else if (err.status === 0) {
            this.message.set('Internal Server Error. Cannot connect to server.');
          }else if(err.status === 409) {
            this.message.set(err.error.message)
          }else {
            this.message.set(`Error ${err.status}: ${err.statusText || 'Unknown error'}`);
          }
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
