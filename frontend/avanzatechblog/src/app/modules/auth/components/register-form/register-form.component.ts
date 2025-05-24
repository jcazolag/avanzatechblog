import { Component, signal, WritableSignal } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CustomValidators } from '@utils/validators';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';
import { RequestStatus } from '@models/request-status.models';
import { LoadingAnimationComponent } from '@modules/shared/components/loading-animation/loading-animation.component';

@Component({
  selector: 'app-register-form',
  imports: [ReactiveFormsModule, LoadingAnimationComponent],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.css'
})
export class RegisterFormComponent {
  form: FormGroup;

  status: RequestStatus = 'init'

  message: WritableSignal<string[]> = signal<string[]>([]);

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.formBuilder.group(
      {
        email: ['', [Validators.email, Validators.required]],
        password: ['', [Validators.minLength(4), Validators.required, Validators.maxLength(128)]],
        confirmPassword: ['', Validators.required]
      }, {
      validators: [CustomValidators.MatchValidator('password', 'confirmPassword')]
    }
    );
  }

  register() {
    if (this.form.valid) {
      this.status = 'loading';
      this.message.set([]);
      const { email, password } = this.form.getRawValue();
      this.authService.register(email, password)
        .subscribe({
          next: (response) => {
            alert("User created successfuly");
            this.status = 'success';
            this.router.navigate(['/login'], { queryParams: { email: response.email } });
          },
          error: (err) => {
            this.status = 'failed'
            if (err.status === 0) {
              this.message.set(['Internal Server Error. Cannot connect to server.']);
            } else {
              for (const key in err.error) {
                if (err.error.hasOwnProperty(key)) {
                  this.message.update(items => [...items, err.error[key]]);
                }
              }
            }
          }
        });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
