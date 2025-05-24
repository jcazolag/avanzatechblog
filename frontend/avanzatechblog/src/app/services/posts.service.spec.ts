import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PostsService } from './posts.service';
import { TokenService } from './token.service';
import { environment } from '@environment/environment';
import { NewPost, Post, PostResponse } from '@models/Post.model';
import { Generic } from '@models/generic.model';
import { HttpErrorResponse } from '@angular/common/http';

describe('PostsService', () => {
  let service: PostsService;
  let httpMock: HttpTestingController;
  let tokenServiceSpy: jasmine.SpyObj<TokenService>;
  const apiUrl = environment.API_URL;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('TokenService', ['getToken']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PostsService,
        { provide: TokenService, useValue: spy }
      ]
    });

    service = TestBed.inject(PostsService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenServiceSpy = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#createPost', () => {
    it('should send POST request to create a new post', () => {
      const newPost: NewPost = {
        title: 'Test Post',
        content: 'This is a test post.',
        author_access: 'Read & Write',
        team_access: 'Read & Write',
        authenticated_access: 'Read Only',
        public_access: 'Read Only'
      };
      const mockResponse: Post = {
        id: 1,
        author: 1,
        author_name: 'Test Author',
        author_team: 1,
        author_team_title: 'Test Team',
        title: newPost.title,
        content: newPost.content,
        excerpt: 'This is a test post.',
        timestamp: new Date().toISOString(),
        author_access: newPost.author_access,
        team_access: newPost.team_access,
        authenticated_access: newPost.authenticated_access,
        public_access: newPost.public_access
      };
      tokenServiceSpy.getToken.and.returnValue('mock-csrf-token');

      service.createPost(newPost).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/api/blog/post/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('X-CSRFToken')).toBe('mock-csrf-token');
      expect(req.request.body).toEqual(newPost);
      req.flush(mockResponse);
    });

    it('should handle error when creating a post fails', () => {
      const newPost: NewPost = {
        title: 'Test Post',
        content: 'This is a test post.',
        author_access: 'Read & Write',
        team_access: 'Read & Write',
        authenticated_access: 'Read Only',
        public_access: 'Read Only'
      };
      const errorMessage = 'Forbidden';
      tokenServiceSpy.getToken.and.returnValue('mock-csrf-token');

      service.createPost(newPost).subscribe({
        next: () => fail('Expected an error, not a successful response'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(403);
          expect(error.statusText).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/api/blog/post/`);
      expect(req.request.method).toBe('POST');
      req.flush(errorMessage, { status: 403, statusText: errorMessage });
    });
  });

  describe('#getPost', () => {
    it('should fetch a post by ID', () => {
      const postId = 1;
      const mockResponse: Post = {
        id: postId,
        author: 1,
        author_name: 'Test Author',
        author_team: 1,
        author_team_title: 'Test Team',
        title: 'Test Post',
        content: 'This is a test post.',
        excerpt: 'This is a test post.',
        timestamp: new Date().toISOString(),
        author_access: 'Read & Write',
        team_access: 'Read & Write',
        authenticated_access: 'Read Only',
        public_access: 'Read Only'
      };
      tokenServiceSpy.getToken.and.returnValue('mock-csrf-token');

      service.getPost(postId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/api/blog/post/${postId}/`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('X-CSRFToken')).toBe('mock-csrf-token');
      req.flush(mockResponse);
    });

    it('should handle error when fetching a post fails', () => {
      const postId = 1;
      const errorMessage = 'Not Found';
      tokenServiceSpy.getToken.and.returnValue('mock-csrf-token');

      service.getPost(postId).subscribe({
        next: () => fail('Expected an error, not a successful response'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/api/blog/post/${postId}/`);
      expect(req.request.method).toBe('GET');
      req.flush(errorMessage, { status: 404, statusText: errorMessage });
    });
  });

  describe('#deletePost', () => {
    it('should send DELETE request to delete a post', () => {
      const blogId = 1;
      const mockResponse: Generic = {
        message: 'Post deleted successfully.'
      };
      tokenServiceSpy.getToken.and.returnValue('mock-csrf-token');

      service.deletePost(blogId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/api/blog/post/${blogId}/`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('X-CSRFToken')).toBe('mock-csrf-token');
      req.flush(mockResponse);
    });

    it('should handle error when deleting a post fails', () => {
      const blogId = 1;
      const errorMessage = 'Forbidden';
      tokenServiceSpy.getToken.and.returnValue('mock-csrf-token');

      service.deletePost(blogId).subscribe({
        next: () => fail('Expected an error, not a successful response'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(403);
          expect(error.statusText).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/api/blog/post/${blogId}/`);
      expect(req.request.method).toBe('DELETE');
      req.flush(errorMessage, { status: 403, statusText: errorMessage });
    });
  });

  describe('#editPost', () => {
    it('should send PUT request to edit a post', () => {
      const postId = 1;
      const updatedPost: NewPost = {
        title: 'Updated Post',
        content: 'This is an updated post.',
        author_access: 'Read & Write',
        team_access: 'Read & Write',
        authenticated_access: 'Read Only',
        public_access: 'Read Only'
      };
      const mockResponse: Post = {
        id: postId,
        author: 1,
        author_name: 'Test Author',
        author_team: 1,
        author_team_title: 'Test Team',
        title: updatedPost.title,
        content: updatedPost.content,
        excerpt: 'This is an updated post.',
        timestamp: new Date().toISOString(),
        author_access: updatedPost.author_access,
        team_access: updatedPost.team_access,
        authenticated_access: updatedPost.authenticated_access,
        public_access: updatedPost.public_access
      };
      tokenServiceSpy.getToken.and.returnValue('mock-csrf-token');

      service.editPost(postId, updatedPost).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/api/blog/post/${postId}/`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.get('X-CSRFToken')).toBe('mock-csrf-token');
      expect(req.request.body).toEqual(updatedPost);
      req.flush(mockResponse);
    });

    it('should handle error when editing a post fails', () => {
      const postId = 1;
      const updatedPost: NewPost = {
        title: 'Updated Post',
        content: 'This is an updated post.',
        author_access: 'Read & Write',
        team_access: 'Read & Write',
        authenticated_access: 'Read Only',
        public_access: 'Read Only'
      };
      const errorMessage = 'Forbidden';
      tokenServiceSpy.getToken.and.returnValue('mock-csrf-token');

      service.editPost(postId, updatedPost).subscribe({
        next: () => fail('Expected an error, not a successful response'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(403);
          expect(error.statusText).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/api/blog/post/${postId}/`);
      expect(req.request.method).toBe('PUT');
      req.flush(errorMessage, { status: 403, statusText: errorMessage });
    });
  });
});
