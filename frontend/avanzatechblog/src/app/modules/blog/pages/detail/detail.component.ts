import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-detail',
  imports: [],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent {
  @Input({required: true}) post_id!: number;
}
