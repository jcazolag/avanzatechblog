import { TestBed } from '@angular/core/testing';
import { CsrftokenService } from './csrftoken.service';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@environment/environment';
import { Generic } from '@models/generic.model';

describe('CsrftokenService', () => {
  let service: CsrftokenService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        CsrftokenService
      ],
    });

    service = TestBed.inject(CsrftokenService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('Should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Should get token CSRF from the backend', () => {
    const mockResponse: Generic = { message: 'Token obtenido' };

    service.fetchCsrfToken().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.API_URL}/api/get_csfr/`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockResponse);
  });

  it('should get CSRF token from cookies', () => {
    Object.defineProperty(document, 'cookie', {
      get: () => 'csrftoken=abc123',
      configurable: true
    });

    const token = service.getToken();
    expect(token).toBe('abc123');
  });

});
