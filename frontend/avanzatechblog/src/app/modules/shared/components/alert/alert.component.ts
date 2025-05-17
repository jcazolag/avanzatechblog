import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-alert',
  imports: [],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent {
  @Input({required: true}) title!: string;
  @Input({required: true}) alert!: boolean;
  @Input({required: true}) button_text!: string
  @Output() toggle = new EventEmitter();
  @Output() action = new EventEmitter();


  toggleAlert(){
    this.toggle.emit();
  }

  doAction(){
    this.action.emit();
  }
}
