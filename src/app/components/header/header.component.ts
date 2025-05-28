import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isLoggedIn = false;

login() {
  // Implémente ici ta logique réelle de login
  this.isLoggedIn = true;
}

logout() {
  // Implémente ici ta logique réelle de logout
  this.isLoggedIn = false;
}

}
