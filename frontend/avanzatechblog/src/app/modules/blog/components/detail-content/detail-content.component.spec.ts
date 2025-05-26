import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { PostFormComponent } from '../post-form/post-form.component';

import { DetailContentComponent } from './detail-content.component';
import { signal, WritableSignal } from '@angular/core';
import { NewPost, Post } from '@models/Post.model';
import { PostsService } from '@services/posts.service';
import { User } from '@models/User.model';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('DetailContentComponent', () => {
  let component: DetailContentComponent;
  let fixture: ComponentFixture<DetailContentComponent>;
  let postServiceSpy: jasmine.SpyObj<PostsService>;
  const editSignal: WritableSignal<boolean> = signal(true);

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
    timestamp: new Date().toISOString(),
    author_access: 'Read & Write',
    team_access: 'Read & Write',
    authenticated_access: 'Read Only',
    public_access: 'Read Only',
  };

  beforeEach(async () => {
    const postSpy = jasmine.createSpyObj('PostsService', ['editPost']);

    await TestBed.configureTestingModule({
      imports: [DetailContentComponent, CommonModule, PostFormComponent],
      providers: [{ provide: PostsService, useValue: postSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailContentComponent);
    component = fixture.componentInstance;

    component.post = signal<Post | null>(mockPost);
    component.edit = signal<boolean>(false);

    postServiceSpy = TestBed.inject(
      PostsService
    ) as jasmine.SpyObj<PostsService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle edit flag', () => {
    expect(component.edit()).toBeFalse();
    component.toggleEdit();
    expect(component.edit()).toBeTrue();
    component.toggleEdit();
    expect(component.edit()).toBeFalse();
  });

  it('should call postService.editPost and update state on success', () => {
    const newPost: NewPost = {
      title: 'New title',
      content: 'New content',
      author_access: 'Read & Write',
      team_access: 'Read Only',
      authenticated_access: 'Read Only',
      public_access: 'None',
    };

    const updatedPost: Post = {
      ...newPost,
      id: 1,
      author: mockUser.id,
      author_name: mockUser.email,
      author_team: mockUser.team,
      author_team_title: 'default',
      excerpt: newPost.content,
      timestamp: mockPost.timestamp,
    };

    postServiceSpy.editPost.and.returnValue(of(updatedPost));

    component.editPost(newPost);

    expect(component.status()).toBe('init');
    expect(component.post()).toEqual(updatedPost);
    expect(component.edit()).toBeFalse();
    expect(component.message()).toEqual([]);
    expect(postServiceSpy.editPost).toHaveBeenCalledWith(1, newPost);
  });

  it('should handle error with status 0', () => {
    const newPost = {} as NewPost;

    postServiceSpy.editPost.and.returnValue(throwError(() => ({ status: 0 })));

    component.editPost(newPost);

    expect(component.status()).toBe('failed');
    expect(component.message()).toEqual([
      'Internal server error. Try again later.',
    ]);
  });

  it('should handle error with validation messages', () => {
    const newPost = {} as NewPost;

    postServiceSpy.editPost.and.returnValue(
      throwError(() => ({
        status: 400,
        error: {
          title: 'Title is required',
          content: 'Content is required',
        },
      }))
    );

    component.editPost(newPost);

    expect(component.status()).toBe('failed');
    expect(component.message()).toContain('Title is required');
    expect(component.message()).toContain('Content is required');
  });

  it('should not call postService if post is null', () => {
    component.post.set(null);
    component.editPost({} as NewPost);
    expect(postServiceSpy.editPost).not.toHaveBeenCalled();
  });

  describe('Template', () => {
    it('should show post info when not in edit mode', () => {
      fixture.detectChanges();

      const title = fixture.debugElement.query(By.css('[name="title"]'))
        .nativeElement.textContent;
      const content = fixture.debugElement.query(By.css('[name="postContent"]'))
        .nativeElement.innerHTML;
      const author = fixture.debugElement.query(By.css('[name="author_name"]'))
        .nativeElement.textContent;
      const teamButton = fixture.debugElement.query(By.css('[name="team"]'))
        .nativeElement.textContent;

      expect(title).toContain(mockPost.title);
      expect(content).toContain(mockPost.content);
      expect(author).toContain(mockPost.author_name);
      expect(teamButton).toContain(`Team: ${mockPost.author_team_title}`);
    });

    it('should show post form when in edit mode', () => {
      component.edit.set(true);
      fixture.detectChanges();

      const formComponent = fixture.debugElement.query(
        By.directive(PostFormComponent)
      );
      expect(formComponent).toBeTruthy();

      const formInputs = formComponent.componentInstance;
      expect(formInputs.post).toEqual(component.post());
      expect(formInputs.title).toBe('Edit Post');
      expect(formInputs.buttonText).toBe('Edit');
    });

    it('should show validation errors when present in edit mode', () => {
      component.edit.set(true);
      component.message.set(['Title required', 'Content required']);
      fixture.detectChanges();

      const errorMessages = fixture.debugElement.queryAll(
        By.css('p[name="errorMsg"]')
      );
      expect(errorMessages.length).toBe(2);
      expect(errorMessages[0].nativeElement.textContent).toContain(
        'Title required'
      );
      expect(errorMessages[1].nativeElement.textContent).toContain(
        'Content required'
      );
    });

    it('should not render post form or errors in view mode', () => {
      component.edit.set(false);
      component.message.set(['Should not appear']);
      fixture.detectChanges();

      const formComponent = fixture.debugElement.query(
        By.directive(PostFormComponent)
      );
      const errorMessages = fixture.debugElement.queryAll(
        By.css('p[name="errorMsg"]')
      );

      expect(formComponent).toBeNull();
      expect(errorMessages.length).toBe(0);
    });
  });
});
