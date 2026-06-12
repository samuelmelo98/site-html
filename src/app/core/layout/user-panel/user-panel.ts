import { Component, EventEmitter, input, output,signal  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfile } from '../../auth/models/user-profile';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { RouterLink, RouterModule } from "@angular/router";
import { environment } from '../../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-user-panel',
  imports: [
    CommonModule,
    AvatarModule,
    ButtonModule,
    RouterLink,
    RouterModule
],
  templateUrl: './user-panel.html',
  styleUrl: './user-panel.css',
})
export class UserPanel {

  perfilSelecionado = input<UserProfile | null>(null);

  vinculoSelecionado = input<string>();

  logout = output<void>();

  changeVinculo = output<void>();

  configOpen = false;

  private readonly API = `${environment.apiUrl}/api/usuarios`;
private readonly API_BASE = environment.apiUrl;

  private readonly http = inject(HttpClient);

  toggleConfig(): void {
    this.configOpen = !this.configOpen;
  }

  get iniciais(): string {

    const nome = this.perfilSelecionado()?.name ?? '';

    return nome
      .split(' ')
      .filter(Boolean)
      .map(p => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  onAvatarSelecionado(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const arquivo = input.files[0];

    const formData = new FormData();

    formData.append('arquivo', arquivo);

    this.http.post<any>(
      `${this.API}/avatar`,
      formData
    ).subscribe({

      next: (resp) => {

        const user = this.perfilSelecionado();

        if (user) {
          user.avatar =
            `${this.API_BASE}/api/usuarios/${user.id}/avatar?t=${Date.now()}`;
        }

      },

      error: (err) => {
        console.error('Erro ao enviar avatar', err);
      }

    });

  }

}
