import { Component, EventEmitter, inject, Input, Output, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RequestStatus } from '@models/request-status.models';
import { CommentService } from '@services/comment.service';
import { UserService } from '@services/user.service';
import { LoadingAnimationComponent } from '@modules/shared/components/loading-animation/loading-animation.component';

@Component({
  selector: 'app-comment-form',
  imports: [ReactiveFormsModule, LoadingAnimationComponent],
  templateUrl: './comment-form.component.html',
  styleUrl: './comment-form.component.css'
})
export class CommentFormComponent {
  @Input({ required: true }) post_id!: number;
  @Output() getComments = new EventEmitter();
  form: FormGroup
  user = inject(UserService).user;
  message: WritableSignal<string[]> = signal<string[]>([]);
  status: RequestStatus = 'init';
  contentFocused: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private commentService: CommentService
  ) {
    this.form = this.formBuilder.group({
      content: ['', [Validators.required]]
    });
  }

  onFocus(){
    this.contentFocused = true;
  }

  cancel(){
    this.form.get('content')?.setValue('');
    this.form.get('content')?.markAsUntouched();
    this.contentFocused = false;
  }

  commentPost() {
    if (this.form.valid) {
      const content = this.form.getRawValue();
      const post = this.post_id;
      if (post) {
        this.status = 'loading';
        this.message.set([]);
        this.commentService.commentPost(post, content)
          .subscribe({
            next: (response) => {
              this.status = 'init';
              this.cancel();
              this.getComments.emit();
            },
            error: (err) => {
              this.status = 'failed';
              if(err.status === 0){
                this.message.set(['Internal Server Error. Cannot connect to server.']);
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
    }else{
      this.form.markAllAsTouched();
    }
  }
}
