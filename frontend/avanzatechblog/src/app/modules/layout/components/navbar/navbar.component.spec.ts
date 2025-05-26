import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarComponent } from './navbar.component';
import { LoadingAnimationComponent } from '@modules/shared/components/loading-animation/loading-animation.component';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { UserService } from '@services/user.service';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { User } from '@models/User.model';
import { By } from '@angular/platform-browser';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  let mockUser: User = { id: 1, email: 'test@example.com', team: 2 };

  beforeEach(async () => {
    const authServiceMock = jasmine.createSpyObj('AuthService', ['logout']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [NavbarComponent, LoadingAnimationComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: UserService,
          useValue: {
            user: signal(mockUser),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the user email if logged in', () => {
    const emailEl = fixture.nativeElement.querySelector(
      'div[title="test@example.com"]'
    );
    expect(emailEl?.textContent).toContain('test@example.com');
  });

  it('should toggle the menu state', () => {
    const initial = component.menu();
    component.toggleMenu();
    expect(component.menu()).toBe(!initial);
  });

  it('should toggle alert visibility', () => {
    const initial = component.alert;
    component.toggleAlert();
    expect(component.alert).toBe(!initial);
  });

  it('should call logout on success', () => {
    authServiceSpy.logout.and.returnValue(of({}));

    component.logout();

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(component.status()).toBe('success');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should handle logout error 403 by clearing user and redirecting', () => {
    authServiceSpy.logout.and.returnValue(
      throwError(() => ({
        status: 403,
        error: { detail: 'Forbidden' },
      }))
    );

    component.logout();

    expect(component.status()).toBe('failed');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should handle logout error 0 as server error', () => {
    authServiceSpy.logout.and.returnValue(
      throwError(() => ({
        status: 0,
        error: {},
      }))
    );

    component.logout();

    expect(component.status()).toBe('failed');
    expect(component.message()).toContain(
      'Internal Server Error. Cannot connect to server.'
    );
  });

  describe('goToLogin', () => {
    it('should navigate to /login if user is undefined', () => {
      component.user = signal(undefined);
      component.goToLogin();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should NOT navigate if user is already defined', () => {
      component.user = signal(mockUser);
      component.goToLogin();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('goToRegister', () => {
    it('should navigate to /register if user is undefined', () => {
      component.user = signal(undefined);
      component.goToRegister();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/register']);
    });

    it('should NOT navigate if user is already defined', () => {
      component.user = signal(mockUser);
      component.goToRegister();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  it('should show Login and Register links if user is not logged in', () => {
    component.user = signal(undefined);
    fixture.detectChanges();

    const loginLink = fixture.debugElement.query(By.css('a[name="Login"]')).nativeElement;
    expect(loginLink.textContent).toContain('Login');

    const registerLink = fixture.debugElement.query(By.css('a[name="Register"]'))
      .nativeElement;
    expect(registerLink.textContent).toContain('Register');
  });

  it('should show user email and logout icon if user is logged in', () => {
    component.user = signal(mockUser);
    fixture.detectChanges();

    const emailText = fixture.debugElement.query(
      By.css('div[title]')
    ).nativeElement;
    expect(emailText.textContent).toContain(mockUser.email);
  });

  it('should call goToLogin when Login link is clicked', () => {
    component.user = signal(undefined);
    spyOn(component, 'goToLogin');
    fixture.detectChanges();

    const loginLink = fixture.debugElement.query(By.css('a[name="Login"]')).nativeElement;
    loginLink.click();

    expect(component.goToLogin).toHaveBeenCalled();
  });

  it('should call goToRegister when Register link is clicked', () => {
    component.user = signal(undefined);
    spyOn(component, 'goToRegister');
    fixture.detectChanges();

    const registerLink = fixture.debugElement.query(By.css('a[name="Register"]'))
      .nativeElement;
    registerLink.click();

    expect(component.goToRegister).toHaveBeenCalled();
  });

  it('should call toggleMenu when hamburger button is clicked', () => {
    spyOn(component, 'toggleMenu');
    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    button.click();

    expect(component.toggleMenu).toHaveBeenCalled();
  });

  it('should show mobile menu if menu() returns true', () => {
    component.user = signal(undefined);
    component.menu = signal(true);
    fixture.detectChanges();

    const mobileMenu = fixture.debugElement.query(By.css('.md\\:hidden.px-4'));
    expect(mobileMenu).toBeTruthy();
  });

  it('should not show mobile menu if menu() returns false', () => {
    component.menu = signal(false);
    fixture.detectChanges();

    const mobileMenu = fixture.debugElement.query(By.css('.md\\:hidden.px-4'));
    expect(mobileMenu).toBeFalsy();
  });

  it('should show loading animation if status is loading', () => {
    component.user = signal(mockUser);
    component.status = signal('loading');
    fixture.detectChanges();

    const loading = fixture.debugElement.query(By.css('app-loading-animation'));
    expect(loading).toBeTruthy();
  });
});
