import { Component, computed, effect, ElementRef, EventEmitter, HostListener, inject, Input, Output, Signal, signal, ViewChild, WritableSignal } from '@angular/core';
import { Post } from '@models/Post.model';
import { CommonModule } from '@angular/common';
import { LikeService } from '@services/like.service';
import { LikeResponse } from '@models/Like.models';
import { CommentService } from '@services/comment.service';
import { UserService } from '@services/user.service';
import { User } from '@models/User.model';
import { RouterLinkWithHref } from '@angular/router';
import { PostsService } from '@services/posts.service';
import { LikePaginatorComponent } from '@modules/shared/components/like-paginator/like-paginator.component';
import { CommentsCountComponent } from '@modules/shared/components/comments-count/comments-count.component';
import { EditButtonComponent } from '@modules/shared/components/edit-button/edit-button.component';
import { DeleteButtonComponent } from '@modules/shared/components/delete-button/delete-button.component';
import { LikeButtonComponent } from '@modules/shared/components/like-button/like-button.component';
import { CommentButtonComponent } from '@modules/shared/components/comment-button/comment-button.component';

@Component({
  selector: 'app-post',
  imports: [
    CommonModule, 
    RouterLinkWithHref, 
    LikePaginatorComponent, 
    CommentsCountComponent, 
    EditButtonComponent,
    DeleteButtonComponent,
    LikeButtonComponent,
    CommentButtonComponent
  ],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css'
})
export class PostComponent {
  @Input({ required: true }) post!: Post;
  @Output() getBlog = new EventEmitter();
  likes: WritableSignal<LikeResponse | null> = signal<LikeResponse | null>(null)
  currentPage = 1;
  comments: WritableSignal<number> = signal<number>(0);
  popoverOpen: boolean = false;
  user = inject(UserService).user;
  liked: WritableSignal<boolean> = signal<boolean>(false);
  alert: boolean = false;
  access_buttons: Signal<boolean> = computed(() => {
    const user: User | undefined = this.user();
    const post: Post = this.post;

    if (!user) return false;
    if (post.author_access !== "Read & Write") return false;
    if (post.team_access !== "Read & Write" && post.author !== user.id) return false;
    if (post.authenticated_access !== "Read & Write" && post.author_team !== user.team) return false;

    return true;
  });

  @ViewChild('popoverRef') popoverRef!: ElementRef;

  constructor(
    private likeService: LikeService,
    private commentService: CommentService,
    private postService: PostsService
  ) { }

  ngOnInit() {
    this.getLikes();
    this.userLiked();
    this.getComments();
  }

  toggleAlert() {
    this.alert = !this.alert;
  }

  userLiked() {
    const user = this.user();
    const post = this.post;
    if (user) {
      this.likeService.userLikedPost(post.id)
        .subscribe({
          next: (res) => {
            if (res) {
              this.liked.set(true); 
            }
          },
          error: (err) => { 
            this.liked.set(false);
          }
        });
    }
  }

  getComments() {
    this.commentService.getComments(this.post.id)
      .subscribe({
        next: (response) => {
          this.comments.set(response.total_count);
        },
        error: (err) => { }
      });
  }

  getLikes(page = this.currentPage) {
    const likes = this.likes();
    if (likes) {
      if (page > likes.total_pages) return;
    }
    if (page < 1) return;

    this.likeService.getLikes(this.post.id, page)
      .subscribe({
        next: (response) => {
          if (response) {
            this.likes.set(response);
            this.currentPage = page;
          }
        },
        error: (err) => {
          console.log(err);
        }
      });
  }

  likePost() {
    const userId = this.user()?.id;
    const likes = this.likes();

    if (!userId || !likes || !likes.results) return;

    if (this.liked()) {
      // Eliminar el like existente
      this.likeService.unlikePost(this.post.id).subscribe({
        next: () => {
          this.getLikes();
          this.liked.set(false);
        },
        error: (err) => {
          if (err.status == 0) {
            alert("Internal server error. Try agian later.")
          }else if ( err.status === 403 ){
            alert("You cannot like the post.")
          }
        },
      });
    } else {
      // Crear nuevo like
      this.likeService.likePost(this.post.id).subscribe({
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
    this.postService.deletePost(this.post.id)
    .subscribe({
      next: (response) => {
        this.getBlog.emit();
      },
      error: (err) =>{
        console.log(err)
      }
    });
    this.toggleAlert();
  }

  togglePopover(event: MouseEvent) {
    event.stopPropagation();
    this.popoverOpen = !this.popoverOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.popoverRef?.nativeElement.contains(event.target)) {
      this.popoverOpen = false;
    }
  }
}
