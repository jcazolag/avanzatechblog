import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-comments-count',
  imports: [],
  templateUrl: './comments-count.component.html',
  styleUrl: './comments-count.component.css'
})
export class CommentsCountComponent {
  @Input({required: true}) commentsCount!: number;
  @Input() link!: (string | number)[]

  constructor(
    private router: Router
  ){}

  goToLink(){
    const link = this.link;
    if (link) {
      this.router.navigate(this.link);
    }
  }
}
