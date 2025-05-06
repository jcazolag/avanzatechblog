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
  showPassword = signal<boolean>(false);
  
  constructor( 
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ){
    this.form = this.formBuilder.group(
      {
        email: ['', [Validators.email, Validators.required]],
        password: ['', [Validators.minLength(4) ,Validators.required]],
        confirmPassword: ['', Validators.required]
      }, {
        validators: [CustomValidators.MatchValidator('password', 'confirmPassword')]
      }
    );
  }

  togglePassword(event: Event){
    this.showPassword.update( show => !show );
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
          console.log(err);
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
