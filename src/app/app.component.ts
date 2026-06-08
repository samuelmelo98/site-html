import { Component, inject, OnInit } from '@angular/core';
import { KeycloakService } from './core/auth/keycloak.service';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ShellComponent } from './core/layout/shell/shell.component';

import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatCardModule,
    MatToolbarModule,
    ShellComponent,
    ToastModule,
    ConfirmDialogModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'frontend-angular';
  private keycloak = inject(KeycloakService);

  token = this.keycloak.getToken();

  login() {
    this.keycloak.login();
    console.log(this.keycloak.getToken);
  }

  logout() {
    this.keycloak.logout();
  }

  getToken() {
    console.log(this.token);
  }

  isLoggedIn() {
    return this.keycloak.isLoggedIn();
  }
}
