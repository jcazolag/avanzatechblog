import { Component, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { NewPost } from '@models/Post.model';
import { RequestStatus } from '@models/request-status.models';
//import { CreateFormComponent } from '@modules/blog/components/create-form/create-form.component';
import { PostFormComponent } from '@modules/blog/components/post-form/post-form.component';
import { PostsService } from '@services/posts.service';

@Component({
  selector: 'app-create-post',
  imports: [PostFormComponent],
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.css'
})
export default class CreatePostComponent {
  message: WritableSignal<string[]> = signal<string[]>([])
  status: WritableSignal<RequestStatus> = signal<RequestStatus>('init');

  constructor(
    private postService: PostsService,
    private router: Router
  ){}

  createPost(newPost: NewPost){
    this.status.set('loading');
    this.postService.createPost(newPost)
    .subscribe({
          next: (response) => {
            this.status.set('success');
            this.router.navigate(['/']);
          },
          error: (err) => {
            this.status.set('failed');
            if( err.status === 0){
              this.message.set(["Internal server error. Try again later."])
            }else {
              for (const key in err.error) {
                if (err.error.hasOwnProperty(key)) {
                  this.message.update(items => [...items, err.error[key]]);
                }
              }
            }
          }
        });
  }

  cancel(){
    this.router.navigate(['/'])
  }
}
