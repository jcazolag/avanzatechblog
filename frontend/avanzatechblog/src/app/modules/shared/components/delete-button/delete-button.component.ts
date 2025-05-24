import { Component, EventEmitter, Input, Output, signal, WritableSignal } from '@angular/core';
import { AlertComponent } from '../alert/alert.component';
import { RequestStatus } from '@models/request-status.models';

@Component({
  selector: 'app-delete-button',
  imports: [AlertComponent],
  templateUrl: './delete-button.component.html',
  styleUrl: './delete-button.component.css'
})
export class DeleteButtonComponent {
  @Output() action = new EventEmitter();
  @Input({required: true}) title!: string;
  @Input({required: true}) status: WritableSignal<RequestStatus>  = signal<RequestStatus>('init');
  @Input({required: true}) message: WritableSignal<string[]> = signal<string[]>([]);
  alert: boolean = false

  toggleAlert(){
    this.alert = !this.alert;
  }

  doAction(){
    this.action.emit();
  }
}
