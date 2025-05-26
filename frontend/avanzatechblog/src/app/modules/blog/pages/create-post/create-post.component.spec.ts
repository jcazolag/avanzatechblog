import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import CreatePostComponent from './create-post.component';
import { PostFormComponent } from '@modules/blog/components/post-form/post-form.component';
import { PostsService } from '@services/posts.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NewPost, Post } from '@models/Post.model';
import { User } from '@models/User.model';
import { By } from '@angular/platform-browser';

describe('CreatePostComponent', () => {
  let component: CreatePostComponent;
  let fixture: ComponentFixture<CreatePostComponent>;
  let postServiceSpy: jasmine.SpyObj<PostsService>;
  let routerSpy: jasmine.SpyObj<Router>;

  let mockUser: User = {
    id: 1,
    email: 'user@user.com',
    team: 1,
  };

  let mockPost: Post = {
    id: 1,
    author: mockUser.id,
    author_name: mockUser.email,
    author_team: mockUser.team,
    author_team_title: 'default',
    title: 'title',
    content: 'content',
    excerpt: 'content',
    timestamp: '2025-05-23T23:03:53.705532Z',
    author_access: 'Read & Write',
    team_access: 'Read & Write',
    authenticated_access: 'Read Only',
    public_access: 'Read Only',
  };

  let newPost: NewPost = {
    title: 'Test',
    content: 'Content',
    author_access: 'Read & Write',
    team_access: 'Read & Write',
    authenticated_access: 'Read Only',
    public_access: 'Read Only',
  };

  beforeEach(async () => {
    const postSpy = jasmine.createSpyObj('PostService', ['createPost']);
    const mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CreatePostComponent, PostFormComponent],
      providers: [
        { provide: PostsService, useValue: postSpy },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePostComponent);
    component = fixture.componentInstance;
    postServiceSpy = TestBed.inject(
      PostsService
    ) as jasmine.SpyObj<PostsService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call postService.createPost and navigate on success', fakeAsync(() => {
    postServiceSpy.createPost.and.returnValue(of(mockPost));

    component.createPost(newPost);
    tick();

    expect(component.status()).toBe('success');
    expect(postServiceSpy.createPost).toHaveBeenCalledWith(newPost);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should handle server error (status = 0)', fakeAsync(() => {
    const error = { status: 0 };
    postServiceSpy.createPost.and.returnValue(throwError(() => error));

    component.createPost(newPost);
    tick();

    expect(component.status()).toBe('failed');
    expect(component.message()).toContain(
      'Internal server error. Try again later.'
    );
  }));

  it('should handle validation errors (status = 400)', fakeAsync(() => {
    const error = {
      status: 400,
      error: {
        title: 'Title is required',
        content: 'Content is too short',
      },
    };
    postServiceSpy.createPost.and.returnValue(throwError(() => error));

    component.createPost({ ...newPost, title: '', content: '' });
    tick();

    expect(component.status()).toBe('failed');
    expect(component.message()).toContain('Title is required');
    expect(component.message()).toContain('Content is too short');
  }));

  it('should navigate to home on cancel()', () => {
    component.cancel();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  describe('Template', () => {
    it('should render the post form component', () => {
      const formEl = fixture.debugElement.query(
        By.directive(PostFormComponent)
      );
      expect(formEl).toBeTruthy();
    });

    it('should display each error message separately when message is not empty', () => {
      component.message.set(['Error 1', 'Error 2']);
      fixture.detectChanges();

      const errorElements = fixture.debugElement.queryAll(
        By.css('p[name="errorMsg"]')
      );
      expect(errorElements.length).toBe(2);
      expect(errorElements[0].nativeElement.textContent).toContain('Error 1');
      expect(errorElements[1].nativeElement.textContent).toContain('Error 2');
    });
  });
});
