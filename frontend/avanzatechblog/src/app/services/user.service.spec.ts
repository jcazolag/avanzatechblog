import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@environment/environment';
import { User } from '@models/User.model';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const mockUser: User = {
    id: 1,
    email: 'john@example.com',
    team: 2
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        UserService
      ]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set user and store in localStorage on successful isUserLogged call', () => {
    service.isUserLogged();

    const req = httpMock.expectOne(`${environment.API_URL}/api/user/me`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);

    expect(service.user()).toEqual(mockUser);
    const storedUser = localStorage.getItem('user');
    expect(storedUser).toBeTruthy();
    expect(JSON.parse(storedUser!)).toEqual(mockUser);
  });

  it('should clear user and remove from localStorage on 403 error', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    service.user.set(mockUser);

    service.isUserLogged();

    const req = httpMock.expectOne(`${environment.API_URL}/api/user/me`);
    req.flush({}, { status: 403, statusText: 'Forbidden' });

    expect(service.user()).toBeUndefined();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('should alert on status 0 error', () => {
    spyOn(window, 'alert');
    service.isUserLogged();

    const req = httpMock.expectOne(`${environment.API_URL}/api/user/me`);
    req.error(new ProgressEvent('error'), { status: 0 });

    expect(window.alert).toHaveBeenCalledWith('Internal Server Error. Cannot connect to server.');
  });

  it('should retrieve user from localStorage if available', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    service.user.set(undefined);

    service.getUserInfo();

    expect(service.user()).toEqual(mockUser);
  });

  it('should not modify user if already set', () => {
    service.user.set(mockUser);
    localStorage.setItem('user', JSON.stringify({ id: 2, name: 'Jane Doe', email: 'jane@example.com' }));

    service.getUserInfo();

    expect(service.user()).toEqual(mockUser);
  });
});
