import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ValidacaoService {

  private http = inject(HttpClient);

  private readonly API = `${environment.apiUrl}/api/validacao`;

  validar(codigo: string) {
    return this.http.get<any>(`${this.API}/${codigo}`);
  }
}