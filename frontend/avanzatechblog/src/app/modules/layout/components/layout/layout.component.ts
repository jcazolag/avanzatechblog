import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '@modules/layout/components/navbar/navbar.component';
import { CsrftokenService } from '@services/csrftoken.service';

@Component({
  selector: 'app-layout',
  imports: [NavbarComponent, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export default class LayoutComponent {

}
