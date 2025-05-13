import { Component, EventEmitter, inject, input, Input, model, Output, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Comment, CommentResponse } from '@models/Comment.models';
import { CommentService } from '@services/comment.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-comment-form',
  imports: [ReactiveFormsModule],
  templateUrl: './comment-form.component.html',
  styleUrl: './comment-form.component.css'
})
export class CommentFormComponent {
  @Input({required: true}) post_id!: number;
  @Output() getComments = new EventEmitter();
  form: FormGroup
  user = inject(UserService).user;
  message: WritableSignal<string> = signal<string>('')

  constructor(
    private formBuilder: FormBuilder,
    private commentService: CommentService
  ){
    this.form = this.formBuilder.group({
      content: ['', [Validators.required]]
    });
  }

  commentPost(){
    if(this.form.valid){
      const content = this.form.getRawValue();
      const post = this.post_id;
      if(post){
        this.commentService.commentPost(post, content)
        .subscribe({
          next: (response) => {
            this.form.get('content')?.setValue('')
            this.getComments.emit();
          },
          error: (err) => {
            this.message.set(err.error.message);
          }
        })
      }
    }
  }
}
