import { Component, EventEmitter, Input, Output, signal, WritableSignal } from '@angular/core';
import { NewPost, Post } from '@models/Post.model';
import { CommonModule } from '@angular/common';
import { PostFormComponent } from '../post-form/post-form.component';
import { PostsService } from '@services/posts.service';

@Component({
  selector: 'app-detail-content',
  imports: [CommonModule, PostFormComponent],
  templateUrl: './detail-content.component.html',
  styleUrl: './detail-content.component.css'
})
export class DetailContentComponent {
  @Input({required: true}) post!: WritableSignal<Post | null>
  @Input({required: true}) edit!: WritableSignal<boolean>;

  message: WritableSignal<string> = signal<string>('')


  constructor(
    private postService: PostsService
  ){}

  editPost(newPost: NewPost){
    const post = this.post();
    if (post) {
      const id = post.id
      if (id) {
        this.postService.editPost(id, newPost)
        .subscribe({
          next: (response) =>{
            this.post.set(response)
            this.edit.set(false);
          },
          error: (err) =>{
            if(err.status === 0){
              this.message.set('Internal server error. Try again later.')
            }else{
              this.message.set(err.error.message)
            }
          }
        })
      }
    }
  }

  toggleEdit(){
    this.edit.set(!this.edit());
  }
}
