import { Component, EventEmitter, Input, Output, signal, WritableSignal } from '@angular/core';
import { RequestStatus } from '@models/request-status.models';
import { LoadingAnimationComponent } from '../loading-animation/loading-animation.component';

@Component({
  selector: 'app-alert',
  imports: [LoadingAnimationComponent],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent {
  @Input({required: true}) title!: string;
  @Input({required: true}) alert!: boolean;
  @Input({required: true}) button_text!: string
  @Input({required: true}) status: WritableSignal<RequestStatus> = signal<RequestStatus>('init');
  @Input({required: true}) message: WritableSignal<string[]> = signal<string[]>([]);
  @Output() toggle = new EventEmitter();
  @Output() action = new EventEmitter();


  toggleAlert(){
    this.toggle.emit();
  }

  doAction(){
    this.action.emit();
  }
}
