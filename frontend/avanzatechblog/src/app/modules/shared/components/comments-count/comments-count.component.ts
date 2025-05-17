import { Component, Input } from '@angular/core';
import { RouterLinkWithHref } from '@angular/router';

@Component({
  selector: 'app-comments-count',
  imports: [RouterLinkWithHref],
  templateUrl: './comments-count.component.html',
  styleUrl: './comments-count.component.css'
})
export class CommentsCountComponent {
  @Input({required: true}) commentsCount!: number;
  @Input() link!: (string | number)[]
}
