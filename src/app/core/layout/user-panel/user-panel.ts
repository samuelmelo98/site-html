import { Component, EventEmitter, input, output, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfile } from '../../auth/models/user-profile';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { HttpClient } from '@angular/common/http';
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
  
  // URL base limpa baseada no proxy para evitar CORS e problemas de porta
  private readonly API = `${environment.apiUrl}/usuarios`; 
  private readonly http = inject(HttpClient);

  // Signal que armazenará a URL segura e autenticada da imagem convertida
  avatarUrlAutenticada = signal<string | null>(null);

  constructor() {
    // Monitora modificações no perfilSelecionado de forma reativa
    effect(() => {
      const user = this.perfilSelecionado();
      if (user && user.id) {
        this.carregarAvatarAutenticado(user.id);
      } else {
        this.avatarUrlAutenticada.set(null);
      }
    });
  }

  toggleConfig(): void {
    this.configOpen = !this.configOpen;
  }

  // Busca a imagem enviando os headers de autenticação por debaixo dos panos
  private carregarAvatarAutenticado(userId: number): void {
    this.http.get(`${this.API}/${userId}/avatar`, { responseType: 'blob' })
      .subscribe({
        next: (blob) => {
          // Converte o binário recebido em uma URL Object interpretável pelo HTML
          const urlObjeto = URL.createObjectURL(blob);
          this.avatarUrlAutenticada.set(urlObjeto);
        },
        error: (err) => {
          console.warn('Usuário sem avatar customizado ou erro na requisição:', err);
          this.avatarUrlAutenticada.set(null);
        }
      });
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
    if (!input.files?.length) return;

    const arquivo = input.files[0];
    const formData = new FormData();
    formData.append('arquivo', arquivo);

    // Faz o upload do novo arquivo
    this.http.post<any>(`${this.API}/avatar`, formData).subscribe({
      next: () => {
        const user = this.perfilSelecionado();
        if (user && user.id) {
          // Força o recarregamento do avatar atualizando o Signal
          this.carregarAvatarAutenticado(user.id);
        }
      },
      error: (err) => {
        console.error('Erro ao enviar avatar', err);
      }
    });
  }
}