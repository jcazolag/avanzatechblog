import { Component, Input, signal, WritableSignal } from '@angular/core';
import { NewPost, Post } from '@models/Post.model';
import { CommonModule } from '@angular/common';
import { PostFormComponent } from '../post-form/post-form.component';
import { PostsService } from '@services/posts.service';
import { RequestStatus } from '@models/request-status.models';

@Component({
  selector: 'app-detail-content',
  imports: [CommonModule, PostFormComponent],
  templateUrl: './detail-content.component.html',
  styleUrl: './detail-content.component.css'
})
export class DetailContentComponent {
  @Input({required: true}) post!: WritableSignal<Post | null>
  @Input({required: true}) edit!: WritableSignal<boolean>;

  message: WritableSignal<string[]> = signal<string[]>([])
  status: WritableSignal<RequestStatus> = signal<RequestStatus>('init');


  constructor(
    private postService: PostsService
  ){}

  editPost(newPost: NewPost){
    const post = this.post();
    if (post) {
      const id = post.id
      if (id) {
        this.status.set('loading');
        this.message.set([]);
        this.postService.editPost(id, newPost)
        .subscribe({
          next: (response) =>{
            this.status.set('init');
            this.post.set(response)
            this.edit.set(false);
          },
          error: (err) =>{
            this.status.set('failed');
            if(err.status === 0){
              this.message.set(['Internal server error. Try again later.'])
            }else{
              for (const key in err.error) {
                if (err.error.hasOwnProperty(key)) {
                  this.message.update(items => [...items, err.error[key]]);
                }
              }
            }
          }
        })
      }
    }
  }

  toggleEdit(){
    this.edit.update(val => !val);
  }
}
