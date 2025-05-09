import { Component } from '@angular/core';
import { CreateFormComponent } from '@modules/blog/components/create-form/create-form.component';

@Component({
  selector: 'app-create-post',
  imports: [CreateFormComponent],
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.css'
})
export default class CreatePostComponent {

}
