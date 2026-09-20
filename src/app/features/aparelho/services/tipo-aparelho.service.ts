import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

export interface TipoAparelhoResponse {
  tipoAparelhoId: number;
  nome: string;
}

@Injectable({ providedIn: 'root' })
export class TipoAparelhoService {
  private readonly http = inject(HttpClient);

  private readonly api =
    `${environment.apiUrl.replace(/\/$/, '')}/tipos-aparelho`;

  listarAtivos(): Observable<TipoAparelhoResponse[]> {
    return this.http.get<TipoAparelhoResponse[]>(this.api);
  }
}