import { Component } from '@angular/core';
import { ServerErrorComponent } from '@modules/shared/server-error/server-error.component';

@Component({
  selector: 'app-server-error-page',
  imports: [ServerErrorComponent],
  templateUrl: './server-error-page.component.html',
  styleUrl: './server-error-page.component.css'
})
export default class ServerErrorPageComponent {

}
