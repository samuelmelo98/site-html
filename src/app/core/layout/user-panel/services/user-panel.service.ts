import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../../../features/users/models/user.model';
import { environment } from '../../../../../environments/environment';
import { UserProfile } from '../../../auth/models/user-profile';

@Injectable({ providedIn: 'root' })
export class UserPanelService {

// Agora ele usa a URL completa: https://api.cluster.stringtecnologiadf.org/users
  private readonly API = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {
    console.log(`API ${this.API}`);
  }
obterAvatar(usuario: UserProfile): Observable<UserProfile> {
    console.log(usuario);
    console.log(this.http.post<User>(this.API, usuario));
    console.log(`API ${this.API}`);
    return this.http.post<UserProfile>(this.API, usuario);
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
            `${this.API}/usuarios/${user.id}/avatar?t=${Date.now()}`;
        }

      },

      error: (err) => {
        console.error('Erro ao enviar avatar', err);
      }

    });

  }
}
