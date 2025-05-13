import { Component, Input } from '@angular/core';
import { Comment } from '@models/Comment.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-comment',
  imports: [CommonModule],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.css'
})
export class CommentComponent {
  @Input({required: true}) comment!: Comment;
}
