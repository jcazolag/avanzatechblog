import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import ListComponent from './list.component';
import { Component, signal, WritableSignal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { BlogService } from '@services/blog.service';
import { UserService } from '@services/user.service';
import { Blog } from '@models/Blog.model';
import { Post } from '@models/Post.model';
import { User } from '@models/User.model';
import { PostComponent } from '@modules/blog/components/post/post.component';
import { NotfoundComponent } from '@modules/shared/notfound/notfound.component';
import { ServerErrorComponent } from '@modules/shared/server-error/server-error.component';
import { LoadingScreenComponent } from '@modules/shared/loading-screen/loading-screen.component';
import { CommonModule } from '@angular/common';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLinkWithHref } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let blogServiceSpy: jasmine.SpyObj<BlogService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  const mockPosts: Post[] = [
    {
      id: 1,
      author: 1,
      author_name: 'Author 1',
      author_team: 1,
      author_team_title: 'Team 1',
      title: 'Post 1',
      content: 'Content 1',
      excerpt: 'Excerpt 1',
      timestamp: '2025-05-22T12:00:00Z',
      author_access: 'Read & Write',
      team_access: 'Read & Write',
      authenticated_access: 'Read Only',
      public_access: 'Read Only',
    },
    {
      id: 2,
      author: 2,
      author_name: 'Author 2',
      author_team: 2,
      author_team_title: 'Team 2',
      title: 'Post 2',
      content: 'Content 2',
      excerpt: 'Excerpt 2',
      timestamp: '2025-05-22T13:00:00Z',
      author_access: 'Read & Write',
      team_access: 'Read & Write',
      authenticated_access: 'Read Only',
      public_access: 'Read Only',
    },
  ];

  const mockBlogData: Blog = {
    current_page: 1,
    total_pages: 2,
    total_count: 2,
    next_page: 'http://127.0.0.1:8000/api/blog/list/?page=2',
    previous_page: null,
    results: mockPosts,
  };

  beforeEach(async () => {
    const blogSpy = jasmine.createSpyObj('BlogService', ['getBlog'], {
      Blog: signal<Blog | null>(null),
    });
    const userSpy = jasmine.createSpyObj('UserService', [], {
      user: signal<User | undefined>(undefined),
    });

    await TestBed.configureTestingModule({
      imports: [
        ListComponent,
        PostComponent,
        CommonModule,
        RouterLinkWithHref,
        NotfoundComponent,
        ServerErrorComponent,
        LoadingScreenComponent,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BlogService, useValue: blogSpy },
        { provide: UserService, useValue: userSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => null,
              },
            },
            params: of({}),
            queryParams: of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    blogServiceSpy = TestBed.inject(BlogService) as jasmine.SpyObj<BlogService>;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('getBlog', () => {
    it('should set status to "success" on successful data retrieval', fakeAsync(() => {
      blogServiceSpy.getBlog.and.returnValue(of(mockBlogData));
      component.getBlog();
      tick();
      expect(component.status()).toBe('success');
    }));

    it('should set Blog to mockBlogData', fakeAsync(() => {
      blogServiceSpy.getBlog.and.returnValue(of(mockBlogData));
      component.getBlog();
      tick();
      expect(component.Blog()).toBe(mockBlogData);
    }));

    it('should set status to "404" on 404 error', fakeAsync(() => {
      const errorResponse = {
        status: 404,
        error: {
          "detail": "Invalid page."
        }
      };
      blogServiceSpy.getBlog.and.returnValue(
        throwError(() => errorResponse)
      );
      component.getBlog();
      tick();
      const status = component.status();
      expect(status).toBe('404');
    }));

    it('should set status to "500" on other errors', fakeAsync(() => {
      blogServiceSpy.getBlog.and.returnValue(
        throwError(() => ({ status: 0 }))
      );
      component.getBlog();
      tick();
      const status = component.status();
      expect(status).toBe('500');
    }));
  });

  describe('Template Rendering', () => {
    it('should display posts when Blog has results', fakeAsync(() => {
      blogServiceSpy.getBlog.and.returnValue(of(mockBlogData));
      component.getBlog();
      tick();
      fixture.detectChanges();

      const postElements = fixture.nativeElement.querySelectorAll('app-post');
      expect(postElements.length).toBe(2);
    }));

    it('should display "There are no posts at the moment" when Blog has no results', fakeAsync(() => {
      const emptyBlogData: Blog = {
        ...mockBlogData,
        results: [],
      };
      blogServiceSpy.getBlog.and.returnValue(of(emptyBlogData));
      component.getBlog();
      tick();
      fixture.detectChanges();

      const messageElement = fixture.nativeElement.querySelector('p.text-center');
      expect(messageElement.textContent).toContain('There are no posts at the moment');
    }));

    it('should display NotfoundComponent when status is "404"', fakeAsync(() => {
      blogServiceSpy.getBlog.and.returnValue(
        throwError(() => ({ status: 404 }))
      );
      component.getBlog();
      tick();
      fixture.detectChanges();

      const notFoundElement = fixture.nativeElement.querySelector('app-notfound');
      expect(notFoundElement).toBeTruthy();
    }));

    it('should display ServerErrorComponent when status is "500"', fakeAsync(() => {
      blogServiceSpy.getBlog.and.returnValue(
        throwError(() => ({ status: 0 }))
      );
      component.getBlog();
      tick();
      fixture.detectChanges();

      const serverErrorElement = fixture.nativeElement.querySelector('app-server-error');
      expect(serverErrorElement).toBeTruthy();
    }));

    it('should display LoadingScreenComponent when status is "loading"', () => {
      component.status.set('loading');
      fixture.detectChanges();

      const loadingElement = fixture.nativeElement.querySelector('app-loading-screen');
      expect(loadingElement).toBeTruthy();
    });

    it('should display "Create Post" button when user is logged in', () => {
      userServiceSpy.user.set({ id: 1, email: 'user@user.com', team: 2 });
      component.status.set('success');
      fixture.detectChanges();

      const createPostButton = fixture.nativeElement.querySelector('a[routerLink="/post-create"]');
      expect(createPostButton).toBeTruthy();
    });

    it('should display "Login" button when user is not logged in', () => {
      userServiceSpy.user.set(undefined);
      component.status.set('success');
      fixture.detectChanges();

      const loginButton = fixture.nativeElement.querySelector('a[routerLink="/login"]');
      expect(loginButton).toBeTruthy();
    });
  });
});
