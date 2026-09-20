import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { MarcaResponse } from '../model/marca.dto';

@Injectable({ providedIn: 'root' })
export class MarcaService {
  private readonly http = inject(HttpClient);

  private readonly api =
    `${environment.apiUrl.replace(/\/$/, '')}/marcas`;

  listarAtivas(): Observable<MarcaResponse[]> {
    return this.http.get<MarcaResponse[]>(this.api);
  }
}