import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, WritableSignal } from '@angular/core';
import { LikeResponse } from '@models/Like.models';

@Component({
  selector: 'app-like-paginator',
  imports: [],
  templateUrl: './like-paginator.component.html',
  styleUrl: './like-paginator.component.css'
})
export class LikePaginatorComponent {
  @Input({required: true}) likes!: WritableSignal<LikeResponse | null>;
  @Input({required: true}) currentPage!: number;
  @Output() getLikesEmmitter = new EventEmitter();

  popoverOpen: boolean = false;
  
  @ViewChild('popoverRef') popoverRef!: ElementRef;

  getLikes(page = this.currentPage){
    this.getLikesEmmitter.emit(page)
  }

  togglePopover(event: MouseEvent) {
    event.stopPropagation(); // Evita que el clic burbujee y lo cierre inmediatamente
    this.popoverOpen = !this.popoverOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.popoverRef?.nativeElement.contains(event.target)) {
      this.popoverOpen = false;
    }
  }
}
