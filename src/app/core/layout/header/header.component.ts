import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeycloakService } from '../../auth/keycloak.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  @Input() menuOpen = true;
  @Output() toggleMenu = new EventEmitter<void>();
  private keycloak = inject(KeycloakService);

  constructor(private router: Router) {}

  user: {
    name?: string;
    email?: string;
    username?: string;
  } | null = null;

  ngOnInit() {
    if (this.keycloak.isLoggedIn()) {
      this.user = this.keycloak.getUserProfile();
    }
  }

  login() {
    this.keycloak.login();
  }

  logout() {
    this.keycloak.logout();
  }
}
