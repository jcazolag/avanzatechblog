import { Component, Input, signal } from '@angular/core';
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
  @Input() email!: string;
  @Input() page!: string;
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

  ngAfterViewInit(){
    if(this.email){{
      this.form.get('email')?.setValue(this.email)
    }}
    console.log(this.page)
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
          this.router.navigate([(this.page ? this.page : '/')]);
          //window.location.reload();
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
