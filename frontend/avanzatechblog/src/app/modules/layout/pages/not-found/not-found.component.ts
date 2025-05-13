import { Component } from '@angular/core';
import { RouterLinkWithHref } from '@angular/router';
import { NotfoundComponent } from '@modules/blog/components/notfound/notfound.component';

@Component({
  selector: 'app-not-found',
  imports: [NotfoundComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})
export default class NotFoundComponent {

}
