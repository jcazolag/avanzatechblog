import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-comment-button',
  imports: [],
  templateUrl: './comment-button.component.html',
  styleUrl: './comment-button.component.css'
})
export class CommentButtonComponent {
  @Input() targetPage!: (string | number)[];

  constructor(
    private router: Router
  ){}

  navigate(){
    const taget = this.targetPage;
    if (taget) {
      this.router.navigate(taget)
    }
  }
}
