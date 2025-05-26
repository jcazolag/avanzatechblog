import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of, throwError } from 'rxjs';

import { PostComponent } from './post.component';
import { provideHttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LikePaginatorComponent } from '@modules/shared/components/like-paginator/like-paginator.component';
import { CommentsCountComponent } from '@modules/shared/components/comments-count/comments-count.component';
import { EditButtonComponent } from '@modules/shared/components/edit-button/edit-button.component';
import { DeleteButtonComponent } from '@modules/shared/components/delete-button/delete-button.component';
import { LikeButtonComponent } from '@modules/shared/components/like-button/like-button.component';
import { CommentButtonComponent } from '@modules/shared/components/comment-button/comment-button.component';
import { Post } from '@models/Post.model';
import { User } from '@models/User.model';
import { signal } from '@angular/core';
import { PostsService } from '@services/posts.service';
import { CommentService } from '@services/comment.service';
import { LikeService } from '@services/like.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Like, LikePostResponse, LikeResponse } from '@models/Like.models';
import { CommentResponse } from '@models/Comment.models';
import { By } from '@angular/platform-browser';

describe('PostComponent', () => {
  let component: PostComponent;
  let fixture: ComponentFixture<PostComponent>;
  let postServiceSpy: jasmine.SpyObj<PostsService>;
  let commentServiceSpy: jasmine.SpyObj<CommentService>;
  let likeServiceSpy: jasmine.SpyObj<LikeService>;
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
    const postSpy = jasmine.createSpyObj('PostService', ['deletePost']);
    const commentSpy = jasmine.createSpyObj('CommentService', ['getComments']);
    const likeSpy = jasmine.createSpyObj('LikeService', [
      'likePost',
      'unlikePost',
      'getLikes',
      'userLikedPost',
    ]);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        PostComponent,
        CommonModule,
        LikePaginatorComponent,
        CommentsCountComponent,
        EditButtonComponent,
        DeleteButtonComponent,
        LikeButtonComponent,
        CommentButtonComponent,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PostsService, useValue: postSpy },
        { provide: CommentService, useValue: commentSpy },
        { provide: LikeService, useValue: likeSpy },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PostComponent);
    component = fixture.componentInstance;
    postServiceSpy = TestBed.inject(
      PostsService
    ) as jasmine.SpyObj<PostsService>;
    likeServiceSpy = TestBed.inject(LikeService) as jasmine.SpyObj<LikeService>;
    commentServiceSpy = TestBed.inject(
      CommentService
    ) as jasmine.SpyObj<CommentService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    //component.post = mockPost;
    //component.user = signal<User | undefined>(mockUser);
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnIOnit', () => {
    it('Should not call userLiked, getLikes and getComments if not post', () => {
      fixture.detectChanges();
      expect(likeServiceSpy.userLikedPost).not.toHaveBeenCalled();
      expect(likeServiceSpy.getLikes).not.toHaveBeenCalled();
      expect(commentServiceSpy.getComments).not.toHaveBeenCalled();
    });

    it('Should call userLiked, getLikes and getComments if post', () => {
      component.post = mockPost;
      component.user = signal<User | undefined>(mockUser);

      likeServiceSpy.userLikedPost.and.returnValue(of(mockLike));
      likeServiceSpy.getLikes.and.returnValue(of(mockLikeResponse));
      commentServiceSpy.getComments.and.returnValue(of(mockCommentResponse));

      fixture.detectChanges();
      expect(likeServiceSpy.userLikedPost).toHaveBeenCalled();
      expect(likeServiceSpy.getLikes).toHaveBeenCalled();
      expect(commentServiceSpy.getComments).toHaveBeenCalled();
    });
  });

  describe('likePost', () => {
    it('should call likeService.likePost and update liked state', () => {
      component.post = mockPost;
      component.user = signal<User | undefined>(mockUser);

      likeServiceSpy.userLikedPost.and.returnValue(
        throwError(() => ({ status: 404 }))
      );
      likeServiceSpy.getLikes.and.returnValue(of(mockLikeResponse));
      commentServiceSpy.getComments.and.returnValue(of(mockCommentResponse));
      likeServiceSpy.likePost.and.returnValue(of(mockLikePostResponse));
      fixture.detectChanges();

      component.likePost();
      //tick();

      expect(likeServiceSpy.likePost).toHaveBeenCalledWith(mockPost.id);
      expect(component.liked()).toBeTrue();
    });

    it('should call likeService.unlikePost and update liked state', () => {
      component.post = mockPost;
      component.user = signal<User | undefined>(mockUser);

      likeServiceSpy.userLikedPost.and.returnValue(of(mockLike));
      likeServiceSpy.getLikes.and.returnValue(of(mockLikeResponse));
      commentServiceSpy.getComments.and.returnValue(of(mockCommentResponse));
      likeServiceSpy.unlikePost.and.returnValue(of({}));
      likeServiceSpy.getLikes.and.returnValue(
        of({ ...mockLikeResponse, results: [] })
      );

      fixture.detectChanges();
      component.likePost();

      expect(likeServiceSpy.unlikePost).toHaveBeenCalledWith(mockPost.id);
      expect(component.liked()).toBeFalse();
    });
  });

  describe('deletePost', () => {
    it('should call postService.deletePost and emit getBlog', () => {
      component.post = mockPost;
      spyOn(component.getBlog, 'emit');
      postServiceSpy.deletePost.and.returnValue(of({ message: '' }));

      component.deletePost();

      expect(postServiceSpy.deletePost).toHaveBeenCalledWith(mockPost.id);
      expect(component.getBlog.emit).toHaveBeenCalled();
    });
  });

  it('should toggle alert state', () => {
    expect(component.alert).toBeFalse();
    component.toggleAlert();
    expect(component.alert).toBeTrue();
    component.toggleAlert();
    expect(component.alert).toBeFalse();
  });

  it('should not call likeService methods if user or likes are undefined', () => {
    component.post = mockPost;
    component.user = signal<User | undefined>(undefined);
    component.likes.set(null);

    component.likePost();

    expect(likeServiceSpy.likePost).not.toHaveBeenCalled();
    expect(likeServiceSpy.unlikePost).not.toHaveBeenCalled();
  });

  describe('getComments', () => {
    it('should update comments count on getComments', () => {
      component.post = mockPost;
      commentServiceSpy.getComments.and.returnValue(of(mockCommentResponse));

      component.getComments();

      expect(commentServiceSpy.getComments).toHaveBeenCalledWith(mockPost.id);
      expect(component.comments()).toBe(mockCommentResponse.total_count);
    });
  });

  it('should update likes and currentPage on getLikes', () => {
    component.post = mockPost;
    likeServiceSpy.getLikes.and.returnValue(of(mockLikeResponse));

    component.getLikes();

    expect(likeServiceSpy.getLikes).toHaveBeenCalledWith(
      mockPost.id,
      component.currentPage
    );
    expect(component.likes()).toEqual(mockLikeResponse);
  });

  describe('goToDetail', () => {
    it('should navigate to post detail', () => {
      component.post = mockPost;

      component.goToDetail();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/post', mockPost.id]);
    });

    it('should navigate to post detail with edit_post query param if true', () => {
      component.post = mockPost;

      component.goToDetail(true);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/post', mockPost.id], {
        queryParams: { edit_post: true },
      });
    });
  });

  describe('Template', () => {
    it('should render post title', () => {
      component.post = mockPost;
      likeServiceSpy.userLikedPost.and.returnValue(of(mockLike));
      likeServiceSpy.getLikes.and.returnValue(of(mockLikeResponse));
      commentServiceSpy.getComments.and.returnValue(of(mockCommentResponse));
      fixture.detectChanges();

      const titleElement = fixture.debugElement.query(
        By.css('div[name="title"]')
      ).nativeElement;
      expect(titleElement).toBeTruthy();
      expect(titleElement.textContent).toContain(mockPost.title);
    });

    it('should render team', () => {
      component.post = mockPost;
      likeServiceSpy.userLikedPost.and.returnValue(of(mockLike));
      likeServiceSpy.getLikes.and.returnValue(of(mockLikeResponse));
      commentServiceSpy.getComments.and.returnValue(of(mockCommentResponse));
      fixture.detectChanges();

      const authorElement = fixture.debugElement.query(
        By.css('[name="team"]')
      ).nativeElement;
      expect(authorElement.textContent).toContain(
        `Team: ${mockPost.author_team_title}`
      );
    });

    it('should render author name', () => {
      component.post = mockPost;
      likeServiceSpy.userLikedPost.and.returnValue(of(mockLike));
      likeServiceSpy.getLikes.and.returnValue(of(mockLikeResponse));
      commentServiceSpy.getComments.and.returnValue(of(mockCommentResponse));
      fixture.detectChanges();

      const authorElement = fixture.debugElement.query(
        By.css('[name="author"]')
      ).nativeElement;
      expect(authorElement.textContent).toContain(`${mockPost.author_name}`);
    });

    it('should render date', () => {
      component.post = mockPost;
      likeServiceSpy.userLikedPost.and.returnValue(of(mockLike));
      likeServiceSpy.getLikes.and.returnValue(of(mockLikeResponse));
      commentServiceSpy.getComments.and.returnValue(of(mockCommentResponse));
      fixture.detectChanges();

      const authorElement = fixture.debugElement.query(
        By.css('[name="date"]')
      ).nativeElement;
      const date = new Date(mockPost.timestamp).toLocaleTimeString();
      expect(authorElement.textContent).toContain(`${date}`);
    });

    it('should render "Show more" link when content is longer than excerpt', () => {
      component.post = {
        ...mockPost,
        content: 'Larger content',
        excerpt: 'content',
      };
      likeServiceSpy.userLikedPost.and.returnValue(of(mockLike));
      likeServiceSpy.getLikes.and.returnValue(of(mockLikeResponse));
      commentServiceSpy.getComments.and.returnValue(of(mockCommentResponse));
      fixture.detectChanges();

      const showMoreLink = fixture.debugElement.query(
        By.css('a[name="show-more"]')
      );
      expect(showMoreLink).toBeTruthy();
      expect(showMoreLink.nativeElement.textContent).toContain('Show more');
    });

    it('should render <app-comments-count>', () => {
      component.post = mockPost;
      likeServiceSpy.userLikedPost.and.returnValue(of(mockLike));
      likeServiceSpy.getLikes.and.returnValue(of(mockLikeResponse));
      commentServiceSpy.getComments.and.returnValue(
        of({ ...mockCommentResponse, total_count: 3 })
      );
      fixture.detectChanges();

      const commentCount = fixture.debugElement.query(
        By.css('app-comments-count')
      ).nativeElement;
      expect(commentCount).toBeTruthy();
      expect(commentCount.textContent).toContain(3);
    });

    it('should render <app-like-paginator>', () => {
      component.post = mockPost;
      likeServiceSpy.userLikedPost.and.returnValue(of(mockLike));
      likeServiceSpy.getLikes.and.returnValue(of(mockLikeResponse));
      commentServiceSpy.getComments.and.returnValue(of(mockCommentResponse));
      fixture.detectChanges();

      const likePaginator = fixture.debugElement.query(
        By.css('app-like-paginator')
      ).nativeElement;
      expect(likePaginator).toBeTruthy();
      expect(likePaginator.textContent).toContain(1);
    });

    describe('if not user', () => {
      it('should not render <app-like-button>', () => {
        component.post = mockPost;
        component.user = signal<User | undefined>(undefined);
        likeServiceSpy.userLikedPost.and.returnValue(of(mockLike));
        likeServiceSpy.getLikes.and.returnValue(of(mockLikeResponse));
        commentServiceSpy.getComments.and.returnValue(of(mockCommentResponse));
        fixture.detectChanges();

        const likeButton = fixture.debugElement.query(
          By.css('app-like-button')
        );
        expect(likeButton).toBeNull();
      });

      it('should not render <app-comment-button>', () => {
        component.post = mockPost;
        component.user = signal<User | undefined>(undefined);
        likeServiceSpy.userLikedPost.and.returnValue(of(mockLike));
        likeServiceSpy.getLikes.and.returnValue(of(mockLikeResponse));
        commentServiceSpy.getComments.and.returnValue(of(mockCommentResponse));
        fixture.detectChanges();

        const commentButton = fixture.debugElement.query(
          By.css('app-comment-button')
        );
        expect(commentButton).toBeNull();
      });

      it('should not render <app-edit-button>', () => {
        component.post = mockPost;
        component.user = signal<User | undefined>(undefined);
        likeServiceSpy.userLikedPost.and.returnValue(of(mockLike));
        likeServiceSpy.getLikes.and.returnValue(of(mockLikeResponse));
        commentServiceSpy.getComments.and.returnValue(of(mockCommentResponse));
        fixture.detectChanges();

        const editButton = fixture.debugElement.query(
          By.css('app-edit-button')
        );
        expect(editButton).toBeNull();
      });

      it('should not render <app-delete-button>', () => {
        component.post = mockPost;
        component.user = signal<User | undefined>(undefined);
        likeServiceSpy.userLikedPost.and.returnValue(of(mockLike));
        likeServiceSpy.getLikes.and.returnValue(of(mockLikeResponse));
        commentServiceSpy.getComments.and.returnValue(of(mockCommentResponse));
        fixture.detectChanges();

        const deleteButton = fixture.debugElement.query(
          By.css('app-delete-button')
        );
        expect(deleteButton).toBeNull();
      });
    });

    describe('if user', () => {
      it('should render <app-like-button>', () => {
        component.post = mockPost;
        component.user = signal<User | undefined>(mockUser);
        likeServiceSpy.userLikedPost.and.returnValue(of(mockLike));
        likeServiceSpy.getLikes.and.returnValue(of(mockLikeResponse));
        commentServiceSpy.getComments.and.returnValue(of(mockCommentResponse));
        fixture.detectChanges();

        const likeButton = fixture.debugElement.query(
          By.css('app-like-button')
        );
        expect(likeButton).toBeTruthy();
      });

      it('should not render <app-comment-button>', () => {
        component.post = mockPost;
        component.user = signal<User | undefined>(mockUser);
        likeServiceSpy.userLikedPost.and.returnValue(of(mockLike));
        likeServiceSpy.getLikes.and.returnValue(of(mockLikeResponse));
        commentServiceSpy.getComments.and.returnValue(of(mockCommentResponse));
        fixture.detectChanges();

        const commentButton = fixture.debugElement.query(
          By.css('app-comment-button')
        );
        expect(commentButton).toBeTruthy();
      });

      it('and no access should not render <app-edit-button>', () => {
        component.post = mockPost;
        component.user = signal<User | undefined>({
          id: 2,
          email: 'another@user.com',
          team: 3,
        });
        likeServiceSpy.userLikedPost.and.returnValue(
          throwError(() => {
            status: 404;
          })
        );
        likeServiceSpy.getLikes.and.returnValue(of(mockLikeResponse));
        commentServiceSpy.getComments.and.returnValue(of(mockCommentResponse));
        fixture.detectChanges();

        const editButton = fixture.debugElement.query(
          By.css('app-edit-button')
        );
        expect(editButton).toBeNull();
      });

      it('and no access should not render <app-delete-button>', () => {
        component.post = mockPost;
        component.user = signal<User | undefined>({
          id: 2,
          email: 'another@user.com',
          team: 3,
        });
        likeServiceSpy.userLikedPost.and.returnValue(
          throwError(() => {
            status: 404;
          })
        );
        likeServiceSpy.getLikes.and.returnValue(of(mockLikeResponse));
        commentServiceSpy.getComments.and.returnValue(of(mockCommentResponse));
        fixture.detectChanges();

        const deleteButton = fixture.debugElement.query(
          By.css('app-delete-button')
        );
        expect(deleteButton).toBeNull();
      });

      it('and has access should render <app-edit-button>', () => {
        component.post = mockPost;
        component.user = signal<User | undefined>(mockUser);
        likeServiceSpy.userLikedPost.and.returnValue(of(mockLike));
        likeServiceSpy.getLikes.and.returnValue(of(mockLikeResponse));
        commentServiceSpy.getComments.and.returnValue(of(mockCommentResponse));
        fixture.detectChanges();

        const editButton = fixture.debugElement.query(
          By.css('app-edit-button')
        );
        expect(editButton).toBeTruthy();
      });

      it('and has access should render <app-delete-button>', () => {
        component.post = mockPost;
        component.user = signal<User | undefined>(mockUser);
        likeServiceSpy.userLikedPost.and.returnValue(of(mockLike));
        likeServiceSpy.getLikes.and.returnValue(of(mockLikeResponse));
        commentServiceSpy.getComments.and.returnValue(of(mockCommentResponse));
        fixture.detectChanges();

        const deleteButton = fixture.debugElement.query(
          By.css('app-delete-button')
        );
        expect(deleteButton).toBeTruthy();
      });
    });
  });
});
