import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TokenService } from './token.service';
import { UserService } from './user.service';
import { environment } from '@environment/environment';
import { User } from '@models/User.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let tokenServiceSpy: jasmine.SpyObj<TokenService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(() => {
    const tokenSpy = jasmine.createSpyObj('TokenService', ['getToken']);
    const userSpy = jasmine.createSpyObj('UserService', ['user'], {
      user: { set: jasmine.createSpy('set') }
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: TokenService, useValue: tokenSpy },
        { provide: UserService, useValue: userSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenServiceSpy = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#login', () => {
    it('should authenticate user and store user data', () => {
      const mockUser: User = { id: 1, email: 'test@example.com', team: 2 };
      const email = 'test@example.com';
      const password = 'password123';

      service.login(email, password).subscribe(user => {
        expect(user).toEqual(mockUser);
        expect(userServiceSpy.user.set).toHaveBeenCalledWith(mockUser);
        expect(localStorage.getItem('user')).toEqual(JSON.stringify(mockUser));
      });

      const req = httpMock.expectOne(`${environment.API_URL}/api/user/login/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email, password });
      req.flush(mockUser);
    });
  });

  describe('#register', () => {
    it('should register a new user', () => {
      const mockUser: User = { id: 2, email: 'newuser@example.com', team: 2 };
      const email = 'newuser@example.com';
      const password = 'newpassword';

      service.register(email, password).subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.API_URL}/api/user/register/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email, password });
      req.flush(mockUser);
    });
  });

  describe('#logout', () => {
    it('should log out the user', () => {
      tokenServiceSpy.getToken.and.returnValue('mock-csrf-token');

      service.logout().subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`${environment.API_URL}/api/user/logout/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('X-CSRFToken')).toBe('mock-csrf-token');
      req.flush({ success: true });
    });
  });
});
