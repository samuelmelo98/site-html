import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KeycloakService } from './core/auth/keycloak.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ShellComponent } from './core/layout/shell/shell.component';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
     MatCardModule,
    MatToolbarModule,
    ShellComponent,

],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent  {
  title = 'frontend-angular';
  token  = KeycloakService.getToken();

  login() {
    KeycloakService.login();
    console.log(KeycloakService.getToken);
  }

  logout() {
    KeycloakService.logout();
  }

  getToken(){
    console.log(this.token);
      }

  isLoggedIn() {
    return KeycloakService.isLoggedIn();
  }
}
