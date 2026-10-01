import { inject, Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { UsuarioAutenticadoDTO } from '../model/usuario-autenticado.dto';

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  private readonly http = inject(HttpClient);

  carregarUsuario(): Observable<UsuarioAutenticadoDTO> {
    return this.http.get<UsuarioAutenticadoDTO>(`${environment.apiUrl}/me`);
  }
}
