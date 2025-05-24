import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CommentService } from './comment.service';
import { TokenService } from './token.service';
import { environment } from '@environment/environment';
import { Comment, CommentResponse } from '@models/Comment.models';
import { HttpErrorResponse } from '@angular/common/http';

describe('CommentService', () => {
  let service: CommentService;
  let httpMock: HttpTestingController;
  let tokenServiceSpy: jasmine.SpyObj<TokenService>;
  const apiUrl = environment.API_URL;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('TokenService', ['getToken']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CommentService,
        { provide: TokenService, useValue: spy }
      ]
    });

    service = TestBed.inject(CommentService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenServiceSpy = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#getComments', () => {
    it('should fetch comments without parameters', () => {
      const mockResponse: CommentResponse = {
        "current_page": 1,
        "total_pages": 6,
        "total_count": 26,
        "next_page": "http://127.0.0.1:8000/api/comment/list/?page=2",
        "previous_page": null,
        "results": [
          {
            "id": 2,
            "user": 2,
            "user_name": "user@user.com",
            "blog": 28,
            "content": "Comment",
            "blog_title": "Lorem Ipsum",
            "timestamp": "2025-05-13T15:43:31.442543Z"
          },
          {
            "id": 3,
            "user": 5,
            "user_name": "abc@email.com",
            "blog": 28,
            "content": "Coment",
            "blog_title": "Lorem Ipsum",
            "timestamp": "2025-05-13T18:45:08.227937Z"
          },
          {
            "id": 4,
            "user": 5,
            "user_name": "abc@email.com",
            "blog": 37,
            "content": "afasfasfas",
            "blog_title": "Lorem Coments",
            "timestamp": "2025-05-13T18:50:43.711092Z"
          },
          {
            "id": 5,
            "user": 5,
            "user_name": "abc@email.com",
            "blog": 37,
            "content": "asdas",
            "blog_title": "Lorem Coments",
            "timestamp": "2025-05-13T19:13:00.813180Z"
          },
          {
            "id": 6,
            "user": 5,
            "user_name": "abc@email.com",
            "blog": 37,
            "content": "New comment",
            "blog_title": "Lorem Coments",
            "timestamp": "2025-05-13T19:32:54.349001Z"
          }
        ]
      };

      service.getComments().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/api/comment/list/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should fetch comments with blog_id and page parameters', () => {
      const blogId = 28;
      const page = 2;
      const mockResponse: CommentResponse = {
        current_page: 2,
        total_pages: 2,
        total_count: 7,
        next_page: null,
        previous_page: 'http://127.0.0.1:8000/api/comment/list/?blog_id=28',
        results: [
          {
            id: 2,
            user: 2,
            user_name: "user@user.com",
            blog: 28,
            content: "Comment",
            blog_title: "Lorem Ipsum",
            timestamp: "2025-05-13T15:43:31.442543Z"
          },
          {
            id: 3,
            user: 5,
            user_name: "abc@email.com",
            blog: 28,
            content: "Coment",
            blog_title: "Lorem Ipsum",
            timestamp: "2025-05-13T18:45:08.227937Z"
          }
        ]
      };

      service.getComments(blogId, page).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/api/comment/list/?blog_id=${blogId}&page=${page}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle error when fetching comments fails', () => {
      const errorMessage = 'Internal Server Error';

      service.getComments().subscribe({
        next: () => fail('Expected an error, not a successful response'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/api/comment/list/`);
      expect(req.request.method).toBe('GET');
      req.flush(errorMessage, { status: 500, statusText: errorMessage });
    });
  });

  describe('#commentPost', () => {
    it('should send POST request to comment on a post', () => {
      const postId = 1;
      const content = 'This is a comment';
      const mockResponse: Comment = {
        id: 2,
        user: 2,
        user_name: "user@user.com",
        blog: 28,
        content: "Comment",
        blog_title: "Lorem Ipsum",
        timestamp: "2025-05-13T15:43:31.442543Z"
      };
      tokenServiceSpy.getToken.and.returnValue('mock-csrf-token');

      service.commentPost(postId, content).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/api/comment/post/${postId}/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('X-CSRFToken')).toBe('mock-csrf-token');
      expect(req.request.body).toBe(content);
      req.flush(mockResponse);
    });

    it('should handle error when commenting on a post fails', () => {
      const postId = 1;
      const content = 'This is a comment';
      const errorMessage = 'Forbidden';
      tokenServiceSpy.getToken.and.returnValue('mock-csrf-token');

      service.commentPost(postId, content).subscribe({
        next: () => fail('Expected an error, not a successful response'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(403);
          expect(error.statusText).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/api/comment/post/${postId}/`);
      expect(req.request.method).toBe('POST');
      req.flush(errorMessage, { status: 403, statusText: errorMessage });
    });
  });
});
