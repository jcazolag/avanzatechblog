import { Component, Input, signal, WritableSignal, inject, Signal, computed, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Post } from '@models/Post.model';
import { User } from '@models/User.model';
import { PostsService } from '@services/posts.service';
import { UserService } from '@services/user.service';
import { CommonModule } from '@angular/common';
import { LikeService } from '@services/like.service';
import { LikeResponse } from '@models/Like.models';
import { CommentService } from '@services/comment.service';
import { BlogService } from '@services/blog.service';
import { Router, RouterLinkWithHref } from '@angular/router';
import { Comment, CommentResponse } from '@models/Comment.models';

@Component({
  selector: 'app-detail',
  imports: [CommonModule, RouterLinkWithHref],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export default class DetailComponent {
  @Input({ required: true }) post_id!: number;
  post: WritableSignal<Post | null> = signal<Post | null>(null);
  user = inject(UserService).user;
  liked: WritableSignal<boolean> = signal<boolean>(false);
  alert: boolean = false;
  access_buttons: Signal<boolean> = computed(() => {
    const user: User | undefined = this.user();
    const post: Post | null = this.post();

    if (!user || !post) return false;
    if (post.author_access !== "Read & Write") return false;
    if (post.team_access !== "Read & Write" && post.author !== user.id) return false;
    if (post.authenticated_access !== "Read & Write" && post.author_team !== user.team) return false;

    return true;
  });
  hasError: WritableSignal<boolean> = signal(false);
  currentLikePage = 1;
  currentMsgPage = 1;
  likes: WritableSignal<LikeResponse | null> = signal<LikeResponse | null>(null);
  comments: WritableSignal<CommentResponse | null> = signal<CommentResponse | null>(null);
  popoverOpen: boolean = false;

  @ViewChild('popoverRef') popoverRef!: ElementRef;


  constructor(
    private postService: PostsService,
    private likeService: LikeService,
    private commentService: CommentService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getPost();
  }

  private getPost() {
    if (this.post_id) {
      this.postService.getPost(this.post_id)
        .subscribe({
          next: (response) => {
            this.post.set(response);
            this.hasError.set(false);
            this.getLikes();
            this.userLiked();
            this.getComments();
          },
          error: (err) => {
            this.hasError.set(true);
          }
        });
    }
  }

  toggleAlert() {
    this.alert = !this.alert;
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
      this.likeService.userLikedPost(post.id, user.id)
        .subscribe({
          next: (res) => {
            if (res) {
              const result = res.results;
              result[0] ? this.liked.set(true) : this.liked.set(false);
            }
          },
          error: (err) => { }
        });
    }
  }

  getComments() {
    const post = this.post()
    if (!post) return;
    this.commentService.getComments(post.id)
      .subscribe({
        next: (response) => {
          this.comments.set(response);
        },
        error: (err) => { }
      });
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
    this.postService.deletePost(post.id);
    this.router.navigate(['/']);
  }

  commentPost(){
    
  }

  togglePopover(event: MouseEvent) {
    event.stopPropagation(); // Evita que el clic burbujee y lo cierre inmediatamente
    this.popoverOpen = !this.popoverOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.popoverRef?.nativeElement.contains(event.target)) {
      this.popoverOpen = false;
    }
  }
}
