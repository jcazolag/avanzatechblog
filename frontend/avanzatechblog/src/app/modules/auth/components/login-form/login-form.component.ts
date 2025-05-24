import { Component, Input, signal, WritableSignal } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestStatus } from '@models/request-status.models';
import { AuthService } from '@services/auth.service';
import { LoadingAnimationComponent } from '@modules/shared/components/loading-animation/loading-animation.component';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, LoadingAnimationComponent],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent {
  @Input() email!: string;
  form: FormGroup;

  status: RequestStatus = 'init'

  showPassword: boolean = false;
  message: WritableSignal<string[]> = signal<string[]>([]);

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {
    this.form = this.formBuilder.group(
      {
        email: ['', [Validators.email, Validators.required]],
        password: ['', [Validators.minLength(4), Validators.required, Validators.maxLength(128)]]
      }
    );
  }

  ngAfterViewInit(){
    const email = this.email;
    if (email){
      this.form.get('email')?.setValue(email);
    }
  }

  togglePassword(event: Event) {
    this.showPassword = !this.showPassword;
  }

  login() {
    if (this.form.valid) {
      this.status = 'loading'
      this.message.set([]);
      const { email, password } = this.form.getRawValue();
      this.authService.login(email, password)
        .subscribe({
          next: (response) => {
            this.status = 'success';
            this.router.navigate(['/']);
            //window.location.reload();
          },
          error: (err) => {
            this.status = 'failed'
            if (err.status === 0) {
              this.message.set(['Internal Server Error. Cannot connect to server.']);
            } else {
              console.log(err);
              
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
