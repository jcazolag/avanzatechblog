import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BlogService } from './blog.service';
import { environment } from '@environment/environment';
import { Blog } from '@models/Blog.model';
import { Generic } from '@models/generic.model';
import { HttpErrorResponse } from '@angular/common/http';

describe('BlogService', () => {
  let service: BlogService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.API_URL;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BlogService]
    });

    service = TestBed.inject(BlogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya solicitudes pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch blog data without page parameter', () => {
    const mockResponse: Blog = {
      current_page: 1,
      total_pages: 1,
      total_count: 1,
      next_page: null,
      previous_page: null,
      results: [
        {
          "id": 37,
          "author": 2,
          "author_name": "user@user.com",
          "author_team": 2,
          "author_team_title": "default",
          "title": "Lorem Coments",
          "content": "Content",
          "excerpt": "Content",
          "timestamp": "2025-05-12T22:42:32.760434Z",
          "author_access": "Read & Write",
          "team_access": "Read Only",
          "authenticated_access": "Read Only",
          "public_access": "Read Only"
        }
      ]
    };

    service.getBlog().subscribe((data) => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/api/blog/list/`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch blog data with page parameter', () => {
    const mockResponse: Blog = {
      current_page: 2,
      total_pages: 2,
      total_count: 11,
      next_page: null,
      previous_page: "http://127.0.0.1:8000/api/blog/list/",
      results: [
        {
          "id": 37,
          "author": 2,
          "author_name": "user@user.com",
          "author_team": 2,
          "author_team_title": "default",
          "title": "Lorem Coments",
          "content": "Content",
          "excerpt": "Content",
          "timestamp": "2025-05-12T22:42:32.760434Z",
          "author_access": "Read & Write",
          "team_access": "Read Only",
          "authenticated_access": "Read Only",
          "public_access": "Read Only"
        }
      ]
    };

    service.getBlog(2).subscribe((data) => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/api/blog/list/?page=2`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch blog data with page parameter', () => {
    const mockResponse: Blog = {
      current_page: 2,
      total_pages: 2,
      total_count: 11,
      next_page: null,
      previous_page: "http://127.0.0.1:8000/api/blog/list/",
      results: [
        {
          "id": 37,
          "author": 2,
          "author_name": "user@user.com",
          "author_team": 2,
          "author_team_title": "default",
          "title": "Lorem Coments",
          "content": "Content",
          "excerpt": "Content",
          "timestamp": "2025-05-12T22:42:32.760434Z",
          "author_access": "Read & Write",
          "team_access": "Read Only",
          "authenticated_access": "Read Only",
          "public_access": "Read Only"
        }
      ]
    };

    service.getBlog(2).subscribe((data) => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/api/blog/list/?page=2`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle 404 error when requesting a non-existent page', () => {
    const invalidPage = 9999;
    const expectedUrl = `${apiUrl}/api/blog/list/?page=${invalidPage}`;

    service.getBlog(invalidPage).subscribe({
      next: () => {
        fail('Expected a 404 error, but the request succeeded.');
      },
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
      }
    });

    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('GET');

    req.flush("Invalid page.", {
      status: 404,
      statusText: 'Not Found'
    });
  });
});
