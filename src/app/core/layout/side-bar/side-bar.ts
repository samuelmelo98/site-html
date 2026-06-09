import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClient  } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { UserPanel } from '../user-panel/user-panel';
import { MenuComponent } from '../menu/menu.component';

import { KeycloakService } from '../../auth/keycloak.service';
import { UserProfile } from '../../auth/models/user-profile';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [
    RouterModule,
    UserPanel,
    MenuComponent,
	CommonModule
  ],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css',
})
export class SideBar implements OnInit {

  @Input() open = true;

  private readonly http = inject(HttpClient);

  private readonly keycloak = inject(KeycloakService);

  userProfile = signal<UserProfile | null>(null);

  documentosOpen = true;

  adminOpen = false;


private readonly API =
`${environment.apiUrl}/api/usuarios`;

  ngOnInit(): void {

    this.carregarPerfil();

  }

  carregarPerfil(): void {

    this.http.get<UserProfile>(
      `${this.API}/me`
    ).subscribe({

      next: (user) => {

        console.log('Perfil recebido', user);

        this.userProfile.set(user);

      },

      error: (err) => {

        console.error('Erro ao carregar perfil', err);

      }

    });

  }

  onLogout(): void {

    this.keycloak.logout();

  }

  onChangeVinculo(): void {

    console.log('Alterar vínculo');

  }

  onOpenSettings(): void {

    console.log('Abrir configurações');

  }

}
