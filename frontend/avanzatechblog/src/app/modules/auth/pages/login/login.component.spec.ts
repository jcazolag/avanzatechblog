import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

import LoginComponent from './login.component';
import { LoginFormComponent } from '@modules/auth/components/login-form/login-form.component';
import { AuthService } from '@services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, LoginFormComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authSpy }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render <app-login-form>', () => {
    const loginFormComponent = fixture.debugElement.query(By.css('app-login-form'));
    expect(loginFormComponent).toBeTruthy();
  });

  it('should pass the email input to <app-login-form>', () => {
    const testEmail = 'test@example.com';
    component.email = testEmail;
    fixture.detectChanges();
    const loginFormComponent = fixture.debugElement.query(By.directive(LoginFormComponent)).componentInstance;
    expect(loginFormComponent.email).toBe(testEmail);
  });

  it('should have a link to /register', () => {
    const linkDebugElement = fixture.debugElement.query(By.css('a[routerLink="/register"]'));
    expect(linkDebugElement).toBeTruthy();
  });
});
