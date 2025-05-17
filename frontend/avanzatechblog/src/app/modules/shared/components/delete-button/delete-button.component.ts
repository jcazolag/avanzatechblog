import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-delete-button',
  imports: [AlertComponent],
  templateUrl: './delete-button.component.html',
  styleUrl: './delete-button.component.css'
})
export class DeleteButtonComponent {
  @Output() action = new EventEmitter()
  @Input({required: true}) title!: string
  alert: boolean = false

  toggleAlert(){
    this.alert = !this.alert;
  }

  doAction(){
    this.action.emit();
  }
}
