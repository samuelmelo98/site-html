import {
  Component,
  Input,
  OnInit,
  inject,
  signal,
} from '@angular/core';

import {
  RouterModule,
} from '@angular/router';

import {
  HttpClient,
} from '@angular/common/http';

import {
  CommonModule,
} from '@angular/common';

import {
  UserPanel,
} from '../user-panel/user-panel';

import {
  KeycloakService,
} from '../../auth/keycloak.service';

import {
  UserProfile,
} from '../../auth/models/user-profile';

import {
  environment,
} from '../../../../environments/environment';

import {
  AuthStore,
} from '../../../../app/features/security/store/auth.store';

import {
  PERMISSOES,
} from '../../../../app/features/security/model/permissoes';

@Component({
  selector: 'app-side-bar',

  standalone: true,

  imports: [
    RouterModule,
    UserPanel,
    CommonModule,
  ],

  templateUrl: './side-bar.html',

  styleUrl: './side-bar.css',
})
export class SideBar implements OnInit {

  @Input()
  open = true;

  private readonly http =
    inject(HttpClient);

  private readonly keycloak =
    inject(KeycloakService);

  private readonly authStore =
    inject(AuthStore);

  readonly PERMISSOES =
    PERMISSOES;

  userProfile =
    signal<UserProfile | null>(null);

  documentosOpen = true;

  adminOpen = false;

  private readonly API =
    `${environment.apiUrl}/usuarios`;

  ngOnInit(): void {

    this.carregarPerfil();

  }

  pode(
    permissao: string
  ): boolean {

    return this.authStore
      .possuiPermissao(permissao);

  }

  carregarPerfil(): void {

    this.http.get<UserProfile>(
      `${this.API}/me`
    )
      .subscribe({

        next: user => {

          if (
            user.avatar?.startsWith('/')
          ) {

            user.avatar =
              `${environment.apiUrl}${user.avatar}`;

          }

          this.userProfile.set(user);

        },

        error: err => {

          console.error(
            'Erro ao carregar perfil',
            err
          );

        },

      });

  }

  onLogout(): void {

    this.authStore.limpar();

    this.keycloak.logout();

  }

  onChangeVinculo(): void {

    console.log(
      'Alterar vínculo'
    );

  }

  onOpenSettings(): void {

    console.log(
      'Abrir configurações'
    );

  }

}