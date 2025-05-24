import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LikeService } from './like.service';
import { TokenService } from './token.service';
import { environment } from '@environment/environment';
import { LikePostResponse, LikeResponse, Like } from '@models/Like.models';
import { HttpErrorResponse } from '@angular/common/http';

describe('LikeService', () => {
  let service: LikeService;
  let httpMock: HttpTestingController;
  let tokenServiceSpy: jasmine.SpyObj<TokenService>;
  const apiUrl = environment.API_URL;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('TokenService', ['getToken']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LikeService,
        { provide: TokenService, useValue: spy }
      ]
    });

    service = TestBed.inject(LikeService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenServiceSpy = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#likePost', () => {
    it('should send POST request to like a post', () => {
      const postId = 1;
      const mockResponse: LikePostResponse = {
        Like: {
          "id": 115,
          "user": 2,
          "blog": 70,
          "user_name": "user@user.com",
          "created_at": "2025-05-22T21:31:40.505623Z"
        }
      };
      tokenServiceSpy.getToken.and.returnValue('mock-csrf-token');

      service.likePost(postId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/api/like/post/${postId}/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('X-CSRFToken')).toBe('mock-csrf-token');
      req.flush(mockResponse);
    });

    it('should handle error when liking a post fails', () => {
      const postId = 1;
      const errorMessage = 'Forbidden';
      tokenServiceSpy.getToken.and.returnValue('mock-csrf-token');

      service.likePost(postId).subscribe({
        next: () => fail('Expected an error, not a successful response'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(403);
          expect(error.statusText).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/api/like/post/${postId}/`);
      expect(req.request.method).toBe('POST');
      req.flush(errorMessage, { status: 403, statusText: errorMessage });
    });
  });

  describe('#unlikePost', () => {
    it('should send DELETE request to unlike a post', () => {
      const postId = 1;
      const mockResponse: LikePostResponse = { message: "Like removed successfully." };
      tokenServiceSpy.getToken.and.returnValue('mock-csrf-token');

      service.unlikePost(postId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/api/like/post/${postId}/`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('X-CSRFToken')).toBe('mock-csrf-token');
      req.flush(mockResponse);
    });

    it('should handle error when unliking a post fails', () => {
      const postId = 1;
      const errorMessage = 'Not Found';
      tokenServiceSpy.getToken.and.returnValue('mock-csrf-token');

      service.unlikePost(postId).subscribe({
        next: () => fail('Expected an error, not a successful response'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/api/like/post/${postId}/`);
      expect(req.request.method).toBe('DELETE');
      req.flush(errorMessage, { status: 404, statusText: errorMessage });
    });
  });

  describe('#getLikes', () => {
    it('should fetch likes without parameters', () => {
      const mockResponse: LikeResponse = {
        current_page: 1,
        total_pages: 2,
        total_count: 16,
        next_page: 'http://127.0.0.1:8000/api/like/list/?page=2',
        previous_page: null,
        results: [
          {
            "id": 113,
            "user": 2,
            "blog": 1,
            "user_name": "user@user.com",
            "created_at": "2025-05-22T16:41:08.367127Z"
          },
        ],
      };

      service.getLikes().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/api/like/list/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should fetch likes with post_id and page parameters', () => {
      const postId = 1;
      const page = 2;
      const mockResponse: LikeResponse = {
        current_page: 2,
        total_pages: 2,
        total_count: 16,
        next_page: null,
        previous_page: 'http://127.0.0.1:8000/api/like/list/?blog_id=1',
        results: [
          {
            "id": 113,
            "user": 2,
            "blog": 1,
            "user_name": "user@user.com",
            "created_at": "2025-05-22T16:41:08.367127Z"
          },
        ],
      };

      service.getLikes(postId, page).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/api/like/list/?blog_id=${postId}&page=${page}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle error when fetching likes fails', () => {
      const errorMessage = 'Internal Server Error';

      service.getLikes().subscribe({
        next: () => fail('Expected an error, not a successful response'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/api/like/list/`);
      expect(req.request.method).toBe('GET');
      req.flush(errorMessage, { status: 500, statusText: errorMessage });
    });
  });

  describe('#userLikedPost', () => {
    it('should fetch like status for a post', () => {
      const postId = 1;
      const mockResponse: Like = {
        id: 32,
        user: 15,
        blog: 4,
        user_name: "user@user.com",
        created_at: new Date().toISOString()
      };
      tokenServiceSpy.getToken.and.returnValue('mock-csrf-token');

      service.userLikedPost(postId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/api/like/post/${postId}/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle error when fetching like status fails', () => {
      const postId = 1;
      const errorMessage = 'Not Found';
      tokenServiceSpy.getToken.and.returnValue('mock-csrf-token');

      service.userLikedPost(postId).subscribe({
        next: () => fail('Expected an error, not a successful response'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/api/like/post/${postId}/`);
      expect(req.request.method).toBe('GET');
      req.flush(errorMessage, { status: 404, statusText: errorMessage });
    });
  });
});
