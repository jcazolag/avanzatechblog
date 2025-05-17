import { Component, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { NewPost } from '@models/Post.model';
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
  message: WritableSignal<string> = signal<string>('')

  constructor(
    private postService: PostsService,
    private router: Router
  ){}

  createPost(newPost: NewPost){
    this.postService.createPost(newPost)
    .subscribe({
          next: (response) => {
            this.router.navigate(['/post', response.post?.id]);
          },
          error: (err) => {
            if( err.status === 0){
              this.message.set("Internal server error. Try again later.")
            }else if(err.status === 403){
              this.message.set("You cannot create a post.")
            }
          }
        });
  }

  cancel(){
    this.router.navigate(['/'])
  }
}
