import { Component, Input, signal, WritableSignal, inject, Signal, computed } from '@angular/core';
import { Post } from '@models/Post.model';
import { User } from '@models/User.model';
import { PostsService } from '@services/posts.service';
import { UserService } from '@services/user.service';
import { CommonModule } from '@angular/common';
import { LikeService } from '@services/like.service';
import { LikeResponse } from '@models/Like.models';
import { CommentService } from '@services/comment.service';
import { ActivatedRoute, Router, RouterLinkWithHref } from '@angular/router';
import { CommentResponse } from '@models/Comment.models';
import { CommentFormComponent } from '@modules/blog/components/comment-form/comment-form.component';
import { CommentComponent } from '@modules/blog/components/comment/comment.component';
import { LikePaginatorComponent } from '@modules/shared/components/like-paginator/like-paginator.component';
import { CommentsCountComponent } from '@modules/shared/components/comments-count/comments-count.component';
import { NotfoundComponent } from '@modules/shared/notfound/notfound.component';
import { EditButtonComponent } from '@modules/shared/components/edit-button/edit-button.component';
import { DeleteButtonComponent } from '@modules/shared/components/delete-button/delete-button.component';
import { LikeButtonComponent } from '@modules/shared/components/like-button/like-button.component';
import { PageStatus, RequestStatus } from '@models/request-status.models';
import { ServerErrorComponent } from '@modules/shared/server-error/server-error.component';
import { LoadingScreenComponent } from '@modules/shared/loading-screen/loading-screen.component';
import { AccessDeniedComponent } from '@modules/shared/access-denied/access-denied.component';
import { DetailContentComponent } from '@modules/blog/components/detail-content/detail-content.component';

@Component({
  selector: 'app-detail',
  imports: [
    CommonModule,
    RouterLinkWithHref,
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
    LikeButtonComponent
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export default class DetailComponent {
  @Input({ required: true }) post_id!: number;
  pageStatus: WritableSignal<PageStatus> = signal<PageStatus>('loading');
  user = inject(UserService).user;
  post: WritableSignal<Post | null> = signal<Post | null>(null);
  access_buttons: Signal<boolean> = computed(() => {
    const user: User | undefined = this.user();
    const post: Post | null = this.post();

    if (
      (!user || !post) ||
      (post.author_access !== "Read & Write") ||
      (post.team_access !== "Read & Write" && post.author !== user.id) ||
      (post.authenticated_access !== "Read & Write" && post.author_team !== user.team)
    ) return false;

    return true;
  });

  edit: WritableSignal<boolean> = signal<boolean>(false);

  deleteStatus: WritableSignal<RequestStatus> = signal<RequestStatus>('init');
  deleteMessage: WritableSignal<string[]> = signal<string[]>([]);

  liked: WritableSignal<boolean> = signal<boolean>(false);
  likedStatus: WritableSignal<RequestStatus> = signal<RequestStatus>('init');
  likes: WritableSignal<LikeResponse | null> = signal<LikeResponse | null>(null);
  currentLikePage = 1;
  likeMessage: WritableSignal<string[]> = signal<string[]>([]);

  comments: WritableSignal<CommentResponse | null> = signal<CommentResponse | null>(null);
  currentMsgPage = 1;
  paginate: Signal<boolean> = computed(() => {
    const comments = this.comments();
    if (comments) {
      const result = comments.results;
      if (result) {
        return result.length > 0 ? true : false;
      }
    }
    return false;
  })

  constructor(
    private postService: PostsService,
    private likeService: LikeService,
    private commentService: CommentService,
    private router: Router,
    private route: ActivatedRoute,
  ) {

  }

  ngOnInit() {
    this.getPost();
    this.paramEdit();
  }

  private paramEdit() {
    this.route.queryParams.subscribe(params => {
      const edit_post = params['edit_post'];
      if (edit_post === 'true' && this.user() !== undefined) {
        this.edit.set(true)
      }
    })
  }


  toggleEdit() {
    this.edit.update( val => !val);
  }

  private getPost() {
    if (this.post_id) {
      this.postService.getPost(this.post_id)
        .subscribe({
          next: (response) => {
            this.post.set(response);
            this.pageStatus.set('success');
            this.getLikes();
            this.userLiked();
            this.getComments();
          },
          error: (err) => {
            console.log(err)
            if (err.status === 404) {
              this.pageStatus.set('404');
            } else if (err.status === 401) {
              this.pageStatus.set('401');
            }
            else {
              this.pageStatus.set('500')
            }
          }
        });
    }
  }

  getLikes(page = this.currentLikePage) {
    const post = this.post();
    if (post) {
      const likes = this.likes();
      if (likes) {
        if (page > likes.total_pages) return;
      }
      if (page < 1) return;

      this.likeService.getLikes(this.post_id, page)
        .subscribe({
          next: (response) => {
            if (response) {
              this.likes.set(response);
              this.currentLikePage = page;
            }
          },
          error: (err) => {
            if (err.status === 0) {
              this.likeMessage.set(['Internal Server Error. Cannot connect to server.']);
            } else {
              for (const key in err.error) {
                if (err.error.hasOwnProperty(key)) {
                  this.likeMessage.update(items => [...items, err.error[key]]);
                }
              }
            }
          }
        });
    }
  }

  userLiked() {
    const user = this.user();
    const post = this.post();
    if (user && post) {
      this.likeService.userLikedPost(post.id)
        .subscribe({
          next: (res) => {
            if (res) {
              this.liked.set(true);
            }
          },
          error: (err) => {
            this.liked.set(false)
          }
        });
    }
  }

  getComments(page = this.currentMsgPage) {
    const post = this.post();
    if (post) {
      const comments = this.comments();
      if (comments) {
        if (page > comments.total_pages) return;
      }
      if (page < 1) return;
      this.commentService.getComments(post.id, page)
        .subscribe({
          next: (response) => {
            this.currentMsgPage = page
            this.comments.set(response);
          },
          error: (err) => { }
        });
    }
  }

  likePost() {
    const userId = this.user()?.id;
    const likes = this.likes();
    const post = this.post();

    if (!userId || !likes || !likes.results || !post) return;
    this.likedStatus.set('loading');
    if (this.liked()) {
      // Eliminar el like existente
      this.likeService.unlikePost(post.id).subscribe({
        next: () => {
          this.getLikes();
          this.liked.set(false);
          this.likedStatus.set('init');
        },
        error: (err) => {
          this.likedStatus.set('init');
        },
      });
    } else {
      // Crear nuevo like
      this.likeService.likePost(post.id).subscribe({
        next: (newLike) => {
          this.getLikes();
          this.liked.set(true);
          this.likedStatus.set('init');
        },
        error: (err) => {
          this.likedStatus.set('init');
        },
      });
    }
  }

  deletePost() {
    const post = this.post()
    if (!post) return;
    this.deleteStatus.set('loading');
    this.deleteMessage.set([]);
    this.postService.deletePost(post.id)
      .subscribe({
        next: (response) => {
          this.deleteStatus.set('success');
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.deleteStatus.set('failed');
          if (err.status === 0) {
            this.deleteMessage.set(['Internal Server Error. Cannot connect to server.']);
          } else {
            for (const key in err.error) {
              if (err.error.hasOwnProperty(key)) {
                this.deleteMessage.update(items => [...items, err.error[key]]);
              }
            }
          }
        }
      });
  }

}
