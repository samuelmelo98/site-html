import { Component, inject, OnInit } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';

import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { KeycloakService } from './core/auth/keycloak.service';
import { ShellComponent } from './core/layout/shell/shell.component';

import { AuthStore } from './features/security/store/auth.store';

@Component({
  selector: 'app-root',

  standalone: true,

  imports: [MatCardModule, MatToolbarModule, ShellComponent, ToastModule, ConfirmDialogModule],

  templateUrl: './app.component.html',

  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'frontend-angular';

  private readonly keycloak = inject(KeycloakService);

  private readonly authStore = inject(AuthStore);

  ngOnInit(): void {
    if (this.keycloak.isLoggedIn()) {
      this.authStore.carregar();
    }
  }

  login(): void {
    this.keycloak.login();
  }

  logout(): void {
    this.authStore.limpar();

    this.keycloak.logout();
  }

  getToken(): void {
    console.log(this.keycloak.getToken());
  }

  isLoggedIn(): boolean {
    return this.keycloak.isLoggedIn();
  }
}
