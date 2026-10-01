import { computed, inject, Injectable, signal } from '@angular/core';

import { finalize } from 'rxjs';

import { SecurityService } from '../service/security.service';
import { UsuarioAutenticadoDTO } from '../model/usuario-autenticado.dto';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly securityService = inject(SecurityService);

  private readonly _usuario = signal<UsuarioAutenticadoDTO | null>(null);

  private readonly _carregando = signal(false);

  private readonly _carregado = signal(false);

  readonly usuario = this._usuario.asReadonly();

  readonly carregando = this._carregando.asReadonly();

  readonly carregado = this._carregado.asReadonly();

  readonly roles = computed(() => this._usuario()?.roles ?? []);

  readonly permissoes = computed(() => this._usuario()?.permissoes ?? []);

  carregar(): void {
    if (this._carregando() || this._carregado()) {
      return;
    }

    this._carregando.set(true);

    this.securityService
      .carregarUsuario()
      .pipe(
        finalize(() => {
          this._carregando.set(false);
          this._carregado.set(true);
        }),
      )
      .subscribe({
        next: (usuario) => {
          this._usuario.set(usuario);

          console.log('[AUTH] usuário carregado', usuario);
        },

        error: (erro) => {
          console.error('[AUTH] erro ao carregar /api/me', erro);

          this._usuario.set(null);
        },
      });
  }

  possuiPermissao(permissao: string): boolean {
    return this.permissoes().includes(permissao);
  }

  limpar(): void {
    this._usuario.set(null);
    this._carregado.set(false);
  }
}
