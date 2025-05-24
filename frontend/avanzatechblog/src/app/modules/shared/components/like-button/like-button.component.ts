import { Component, EventEmitter, Input, Output, WritableSignal } from '@angular/core';
import { RequestStatus } from '@models/request-status.models';
import { LoadingAnimationComponent } from '../loading-animation/loading-animation.component';

@Component({
  selector: 'app-like-button',
  imports: [LoadingAnimationComponent],
  templateUrl: './like-button.component.html',
  styleUrl: './like-button.component.css'
})
export class LikeButtonComponent {
  @Input({required: true}) liked!: boolean
  @Input({required: true}) status!: WritableSignal<RequestStatus>
  @Output() like = new EventEmitter()

  likePost(){
    this.like.emit()
  }
}
