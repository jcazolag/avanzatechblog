import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-like-button',
  imports: [],
  templateUrl: './like-button.component.html',
  styleUrl: './like-button.component.css'
})
export class LikeButtonComponent {
  @Input({required: true}) liked!: boolean
  @Output() like = new EventEmitter()

  likePost(){
    this.like.emit()
  }
}
