import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-animation',
  imports: [],
  templateUrl: './loading-animation.component.html',
  styleUrl: './loading-animation.component.css'
})
export class LoadingAnimationComponent {
  @Input() border_color: string = 'gray-700'
}
