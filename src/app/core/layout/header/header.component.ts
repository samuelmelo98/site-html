import { Component, OnInit, EventEmitter,Input,Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeycloakService } from '../../auth/keycloak.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
@Input() menuOpen = true;
@Output() toggleMenu = new EventEmitter<void>();
  constructor(private router: Router) {}

  user: {
    name?: string;
    email?: string;
    username?: string;
  } | null = null;

  ngOnInit() {
    if (KeycloakService.isLoggedIn()) {
      this.user = KeycloakService.getUserProfile();
    }
  }

  login() {
    KeycloakService.login();
  }


  logout() {
    KeycloakService.logout();
  }



}
