import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import DetailComponent from './detail.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DetailContentComponent } from '@modules/blog/components/detail-content/detail-content.component';
import { CommentFormComponent } from '@modules/blog/components/comment-form/comment-form.component';
import { CommentComponent } from '@modules/blog/components/comment/comment.component';
import { LikePaginatorComponent } from '@modules/shared/components/like-paginator/like-paginator.component';
import { CommentsCountComponent } from '@modules/shared/components/comments-count/comments-count.component';
import { NotfoundComponent } from '@modules/shared/notfound/notfound.component';
import { ServerErrorComponent } from '@modules/shared/server-error/server-error.component';
import { AccessDeniedComponent } from '@modules/shared/access-denied/access-denied.component';
import { LoadingScreenComponent } from '@modules/shared/loading-screen/loading-screen.component';
import { EditButtonComponent } from '@modules/shared/components/edit-button/edit-button.component';
import { DeleteButtonComponent } from '@modules/shared/components/delete-button/delete-button.component';
import { LikeButtonComponent } from '@modules/shared/components/like-button/like-button.component';
import { signal } from '@angular/core';
import { LikeService } from '@services/like.service';
import { PostsService } from '@services/posts.service';
import { CommentService } from '@services/comment.service';
import { of, throwError } from 'rxjs';
import { CommentResponse } from '@models/Comment.models';
import { Like, LikePostResponse, LikeResponse } from '@models/Like.models';
import { Post } from '@models/Post.model';
import { User } from '@models/User.model';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let postService: jasmine.SpyObj<PostsService>;
  let likeService: jasmine.SpyObj<LikeService>;
  let commentService: jasmine.SpyObj<CommentService>;
  let routerSpy: Router;

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

  let mockLike: Like = {
    id: 1,
    user: mockUser.id,
    blog: mockPost.id,
    user_name: mockUser.email,
    created_at: new Date().toISOString(),
  };

  let mockLikeResponse: LikeResponse = {
    current_page: 1,
    total_pages: 1,
    total_count: 1,
    next_page: null,
    previous_page: null,
    results: [mockLike],
  };

  let mockLikePostResponse: LikePostResponse = {
    Like: mockLike,
  };

  let mockCommentResponse: CommentResponse = {
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    next_page: null,
    previous_page: null,
    results: [],
  };

  beforeEach(async () => {
    const postSpy = jasmine.createSpyObj('PostService', [
      'getPost',
      'deletePost',
      'editPost',
    ]);
    const likeSpy = jasmine.createSpyObj('LikeService', [
      'likePost',
      'unlikePost',
      'getLikes',
      'userLikedPost',
    ]);
    const commentSpy = jasmine.createSpyObj('CommentService', [
      'getComments',
      'commentPost',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        DetailComponent,
        CommonModule,
        RouterTestingModule,
        DetailContentComponent,
        CommentFormComponent,
        CommentComponent,
        LikePaginatorComponent,
        CommentsCountComponent,
        NotfoundComponent,
        ServerErrorComponent,
        AccessDeniedComponent,
        LoadingScreenComponent,
        EditButtonComponent,
        DeleteButtonComponent,
        LikeButtonComponent,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PostsService, useValue: postSpy },
        { provide: LikeService, useValue: likeSpy },
        { provide: CommentService, useValue: commentSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    component.user = signal<User | undefined>(undefined);
    postService = TestBed.inject(PostsService) as jasmine.SpyObj<PostsService>;
    likeService = TestBed.inject(LikeService) as jasmine.SpyObj<LikeService>;
    commentService = TestBed.inject(
      CommentService
    ) as jasmine.SpyObj<CommentService>;
    routerSpy = TestBed.inject(Router);
    component.post_id = mockPost.id;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call getPost with the route ID on init', () => {
      postService.getPost.and.returnValue(of(mockPost));
      fixture.detectChanges();

      expect(component.edit()).toBeFalse();
      expect(postService.getPost).toHaveBeenCalledWith(mockPost.id);
      expect(component.post()).toBe(mockPost);
    });
  });

  describe('getPost', () => {
    beforeEach(() => {
      likeService.getLikes.and.returnValue(of(mockLikeResponse));
      likeService.userLikedPost.and.returnValue(of(mockLike));
      commentService.getComments.and.returnValue(of(mockCommentResponse));
    });

    it('should handle successful getPost (status success) and show content', () => {
      postService.getPost.and.returnValue(of(mockPost));
      fixture.detectChanges();
      expect(postService.getPost).toHaveBeenCalled();
      expect(component.pageStatus()).toEqual('success');
      expect(component.post()).toEqual(mockPost);
      const detailContent = fixture.debugElement.query(
        By.css('app-detail-content')
      );
      expect(detailContent).toBeTruthy();
    });

    it('should set status 404 and show NotFound on 404 error', () => {
      postService.getPost.and.returnValue(throwError(() => ({ status: 404 })));
      fixture.detectChanges();
      expect(postService.getPost).toHaveBeenCalled();
      expect(component.pageStatus()).toEqual('404');
      const notFound = fixture.debugElement.query(By.css('app-notfound'));
      expect(notFound).toBeTruthy();
    });

    it('should set status 401 and show app-access-denied on 401 error', () => {
      postService.getPost.and.returnValue(throwError(() => ({ status: 401 })));
      fixture.detectChanges();
      expect(postService.getPost).toHaveBeenCalled();
      expect(component.pageStatus()).toBe('401');
      expect(
        fixture.debugElement.query(By.css('app-access-denied'))
      ).toBeTruthy();
    });

    it('should set status 500 and show ServerError on 0 error', () => {
      postService.getPost.and.returnValue(throwError(() => ({ status: 0 })));
      fixture.detectChanges();
      expect(component.pageStatus()).toBe('500');
      expect(
        fixture.debugElement.query(By.css('app-server-error'))
      ).toBeTruthy();
    });
  });

  describe('likePost', () => {
    beforeEach(() => {
      likeService.getLikes.and.returnValue(of(mockLikeResponse));
      commentService.getComments.and.returnValue(of(mockCommentResponse));
      postService.getPost.and.returnValue(of(mockPost));
      likeService.unlikePost.and.returnValue(of({ message: '' }));
      component.user.set(mockUser);
    });

    it('should call likePost on LikeService and set liked=true when not already liked', () => {
      likeService.userLikedPost.and.returnValue(
        throwError(() => ({ status: 404 }))
      );
      likeService.likePost.and.returnValue(of(mockLikePostResponse));
      fixture.detectChanges();
      component.likePost();
      expect(likeService.likePost).toHaveBeenCalled();
      expect(component.liked()).toBeTrue();
    });

    it('should call unlikePost on LikeService and set liked=false when already liked', () => {
      likeService.userLikedPost.and.returnValue(of(mockLike));
      fixture.detectChanges();

      component.likePost();
      expect(likeService.unlikePost).toHaveBeenCalled();
      expect(component.liked()).toBeFalse();
    });
  });

  describe('deletePost', () => {
    beforeEach(() => {
      likeService.getLikes.and.returnValue(of(mockLikeResponse));
      commentService.getComments.and.returnValue(of(mockCommentResponse));
      postService.getPost.and.returnValue(of(mockPost));
      component.user.set(mockUser);
      likeService.userLikedPost.and.returnValue(of(mockLike));
    });

    it('should navigate to posts list on successful delete', () => {
      postService.deletePost.and.returnValue(of({ message: '' }));
      fixture.detectChanges();
      component.deletePost();

      expect(postService.deletePost).toHaveBeenCalled();
      expect(component.deleteStatus()).toBe('success');
    });

    it('should set error status on delete failure and not navigate', () => {
      postService.deletePost.and.returnValue(
        throwError(() => ({ status: 500 }))
      );
      fixture.detectChanges();
      component.deletePost();

      const navigateSpy = spyOn(routerSpy, 'navigate');

      expect(component.deleteStatus()).toBe('failed');
      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('Template', () => {
    beforeEach(() => {
      likeService.getLikes.and.returnValue(of(mockLikeResponse));
      commentService.getComments.and.returnValue(of(mockCommentResponse));
      postService.getPost.and.returnValue(of(mockPost));
      likeService.userLikedPost.and.returnValue(of(mockLike));
    });

    it('should show edit/delete buttons only when access_buttons() is true', () => {
      // Simulate user matching post author
      fixture.detectChanges();
      component.user.set(mockUser);
      fixture.detectChanges();
      expect(
        fixture.debugElement.query(By.css('app-edit-button'))
      ).toBeTruthy();
      expect(
        fixture.debugElement.query(By.css('app-delete-button'))
      ).toBeTruthy();

      // Simulate different user
      component.user.set({ id: 2, email: 'another@user.com', team: 3 });
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('app-edit-button'))).toBeNull();
      expect(
        fixture.debugElement.query(By.css('app-delete-button'))
      ).toBeNull();
    });

    it('should toggle to edit-mode view when edit() signal is true', () => {
      component.edit.set(true);
      fixture.detectChanges();
      const detail = fixture.debugElement.query(By.css('app-detail-content'));
      expect(detail).toBeTruthy();
      expect(detail.componentInstance.edit()).toBeTrue();
      expect(fixture.debugElement.query(By.css('app-like-button'))).toBeNull();
      expect(fixture.debugElement.query(By.css('app-comment'))).toBeNull();
    });

    it('should show comment form only when user is defined', () => {
      component.user.set(undefined);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('app-comment-form'))).toBeNull();
      component.user.set(mockUser);
      fixture.detectChanges();
      expect(
        fixture.debugElement.query(By.css('app-comment-form'))
      ).toBeTruthy();
    });

  });
});
