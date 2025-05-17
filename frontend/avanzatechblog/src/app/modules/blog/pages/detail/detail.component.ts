import { Component, Input, signal, WritableSignal, inject, Signal, computed } from '@angular/core';
import { Post } from '@models/Post.model';
import { User } from '@models/User.model';
import { PostsService } from '@services/posts.service';
import { UserService } from '@services/user.service';
import { CommonModule } from '@angular/common';
import { LikeService } from '@services/like.service';
import { LikeResponse } from '@models/Like.models';
import { CommentService } from '@services/comment.service';
import {  Router, RouterLinkWithHref } from '@angular/router';
import { CommentResponse } from '@models/Comment.models';
import { CommentFormComponent } from '@modules/blog/components/comment-form/comment-form.component';
import { CommentComponent } from '@modules/blog/components/comment/comment.component';
import { LikePaginatorComponent } from '@modules/shared/components/like-paginator/like-paginator.component';
import { CommentsCountComponent } from '@modules/shared/components/comments-count/comments-count.component';
import { NotfoundComponent } from '@modules/shared/notfound/notfound.component';
import { EditButtonComponent } from '@modules/shared/components/edit-button/edit-button.component';
import { DeleteButtonComponent } from '@modules/shared/components/delete-button/delete-button.component';
import { LikeButtonComponent } from '@modules/shared/components/like-button/like-button.component';
import { PageStatus } from '@models/request-status.models';
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
  status: WritableSignal<PageStatus> = signal<PageStatus>('loading');
  post: WritableSignal<Post | null> = signal<Post | null>(null);
  user = inject(UserService).user;
  liked: WritableSignal<boolean> = signal<boolean>(false);
  likes: WritableSignal<LikeResponse | null> = signal<LikeResponse | null>(null);
  currentLikePage = 1;
  comments: WritableSignal<CommentResponse | null> = signal<CommentResponse | null>(null);
  currentMsgPage = 1;
  edit: WritableSignal<boolean> = signal<boolean>(false);
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
  ) { }

  ngOnInit() {
    this.getPost();
  }

  toggleEdit(){
    this.edit.set(!this.edit())
  }

  private getPost() {
    if (this.post_id) {
      this.postService.getPost(this.post_id)
        .subscribe({
          next: (response) => {
            this.post.set(response);
            this.status.set('success');
            this.getLikes();
            this.userLiked();
            this.getComments();
          },
          error: (err) => {
            console.log(err)
            if(err.status === 404){
              this.status.set('404');
            }else if(err.status === 401){
              this.status.set('401');
            }
            else{
              this.status.set('500')
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
            console.log(err);
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

    if (this.liked()) {
      // Eliminar el like existente
      this.likeService.unlikePost(post.id).subscribe({
        next: () => {
          this.getLikes();
          this.liked.set(false);
        },
        error: (err) => {
          console.error('Error eliminando like:', err);
        },
      });
    } else {
      // Crear nuevo like
      this.likeService.likePost(post.id).subscribe({
        next: (newLike) => {
          this.getLikes();
          this.liked.set(true);
        },
        error: (err) => {
          console.error('Error creando like:', err);
        },
      });
    }
  }

  deletePost() {
    const post = this.post()
    if (!post) return;
    this.postService.deletePost(post.id)
      .subscribe({
        next: (response) => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.log(err)
          alert("There was an error. Try again.")
        }
      });
  }

}
