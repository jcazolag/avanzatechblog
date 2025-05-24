import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { LoginFormComponent } from './login-form.component';
import { LoadingAnimationComponent } from '@modules/shared/components/loading-animation/loading-animation.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';


describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginFormComponent, LoadingAnimationComponent, ReactiveFormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerMock }
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Exists H1 and has text: Login', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const h1 = compiled.querySelector('h1');

    expect(h1).toBeTruthy();
    expect(h1?.textContent).toContain('Login');
  });

  it('Exists form and its inputs', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const form = compiled.querySelector('form');

    expect(form).toBeTruthy();
    expect(component.form.contains('email')).toBeTrue();
    expect(component.form.contains('password')).toBeTrue();
  });

  it('Should show error message when invalid email', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('correo-invalido');
    emailControl?.markAsTouched();
    fixture.detectChanges();

    const errorMessage = fixture.debugElement.query(By.css('p.text-red-500'));
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.nativeElement.textContent).toContain('This field should be an email');
  });

  it('Should show error message when the password is to short', () => {
    const passwordControl = component.form.get('password');
    passwordControl?.setValue('123');
    passwordControl?.markAsTouched();
    fixture.detectChanges();

    const errorMessage = fixture.debugElement.query(By.css('p.text-red-500'));
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.nativeElement.textContent).toContain('Should be at least 4 characters');
  });

  it('Submit button should show "Login" whent status is "init"', () => {
    component.status = 'init';
    fixture.detectChanges();

    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(submitButton.nativeElement.textContent).toContain('Login');
  });

  it('Submit button shouls show "Retry" when status is "failed"', () => {
    component.status = 'failed';
    fixture.detectChanges();

    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(submitButton.nativeElement.textContent).toContain('Retry');
  });

  it('Should show <app-loading-animation> when status is "loading"', () => {
    component.status = 'loading';
    fixture.detectChanges();

    const loadingComponent = fixture.debugElement.query(By.css('app-loading-animation'));
    expect(loadingComponent).toBeTruthy();
  });

  it('Should change password input type on togglePassword', () => {
    expect(component.showPassword).toBeFalse();
    component.togglePassword(new Event('click'));
    expect(component.showPassword).toBeTrue();
  });

  it('Should mark all inputs as touched if form is invalid', () => {
    spyOn(component.form, 'markAllAsTouched');
    component.login();
    expect(component.form.markAllAsTouched).toHaveBeenCalled();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('Should go to home on successful login', fakeAsync(() => {
    component.form.setValue({ email: 'test@example.com', password: '1234' });
    authServiceSpy.login.and.returnValue(of({ id: 3, email: 'test@example.com', team: 2 }));

    component.login();
    tick();

    expect(component.status).toBe('success');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('Should show conection error on server error', fakeAsync(() => {
    component.form.setValue({ email: 'test@example.com', password: '1234' });
    authServiceSpy.login.and.returnValue(throwError(() => ({ status: 0 })));

    component.login();
    tick();

    expect(component.status).toBe('failed');
    expect(component.message()).toContain('Internal Server Error. Cannot connect to server.');
  }));

  it('Should show Invalid credentials error message on invalid user', fakeAsync(() => {
    component.form.setValue({ email: 'usuario@ejemplo.com', password: 'contraseñaIncorrecta' });

    const errorResponse = {
      status: 401,
      error: {
        "message": "Invalid credentials"
      }
    };

    authServiceSpy.login.and.returnValue(throwError(() => errorResponse));

    component.login();
    tick();

    expect(component.status).toBe('failed');

    const mensajes = component.message();
    expect(mensajes).toContain('Invalid credentials');
  }));

});
