import { Component, computed, ElementRef, HostListener, inject, Input, Signal, signal, ViewChild, WritableSignal } from '@angular/core';
import { Post } from '@models/Post.model';
import { CommonModule } from '@angular/common';
import { LikeService } from '@services/like.service';
import { LikeResponse } from '@models/Like.models';
import { CommentService } from '@services/comment.service';
import { UserService } from '@services/user.service';
import { Router } from '@angular/router';
import { BlogService } from '@services/blog.service';
import { User } from '@models/User.model';

@Component({
  selector: 'app-post',
  imports: [CommonModule],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css'
})
export class PostComponent {
  @Input({required: true}) post!: Post;
  likes: WritableSignal<LikeResponse | null> = signal<LikeResponse | null>(null)
  currentPage = 1;
  comments: WritableSignal<number> = signal<number>(0);
  popoverOpen: boolean = false;
  user = inject(UserService).user;
  liked: WritableSignal<boolean> = signal<boolean>(false);
  alert: boolean = false;
  access_buttons: Signal<boolean> = computed( () => {
    const user: User | undefined = this.user();
    const post: Post = this.post;

    if(!user) return false;
    if(post.author_access !== "Read & Write") return false;
    if(post.team_access !== "Read & Write" && post.author !== user.id) return false;
    if(post.authenticated_access !== "Read & Write" && post.author_team !== user.team) return false;

    return true;
  });

  @ViewChild('popoverRef') popoverRef!: ElementRef;

  constructor(
    private likeService: LikeService,
    private commentService: CommentService,
    private blogService: BlogService,
    private router: Router
  ){}

  ngOnInit(){
    this.getLikes();
    this.userLiked();
    this.getComments();
  }

  toggleAlert(){
    this.alert = !this.alert;
  }

  userLiked(){
    const user = this.user();
    const post = this.post;
    if(user){
      const response = this.likeService.userLikedPost(post.id, user.id);
      if(response){
        response.subscribe({
          next: (res) => {
            if(res){
              const result = res.results;
              result[0] ? this.liked.set(true) : this.liked.set(false);
            }
          },
          error: (err) =>  {}
        });
      }
    }
  }

  getComments(){
    this.commentService.getComments(this.post.id)
    .subscribe({
      next: (response) =>{
        this.comments.set(response.total_count);
      },
      error: (err) => {}
    });
  }

  getLikes(page = this.currentPage){
    const likes = this.likes();
    if(likes){
      if(page > likes.total_pages) return;
    }
    if(page < 1) return;

    this.likeService.getLikes(this.post.id, page)
    .subscribe({
      next: (response) =>{
        if(response){
          this.likes.set(response);
          this.currentPage = page;
        }
      },
      error: (err) =>{}
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
          console.error('Error eliminando like:', err);
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

  deletePost(){
    this.blogService.deleteBlog(this.post.id)
    .subscribe({
      next: () => {
        window.location.reload();
      },
      error: (err) => {
        console.log(err)
      }
    });
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
