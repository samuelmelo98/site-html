import {
  Injectable,
  inject,
} from '@angular/core';

import {
  HttpClient,
} from '@angular/common/http';

import {
  Observable,
} from 'rxjs';

import {
  ConsultaOrdemServicoRequestDTO,
  ConsultaOrdemServicoResponseDTO,
} from '../model/consulta-ordem-servico.dto';

import {
  environment,
} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConsultaOrdemServicoService {

  private readonly http =
    inject(HttpClient);

  private readonly baseUrl =
    `${environment.apiUrl}/public/ordens-servico`;

  consultar(
    numero: string,
    request: ConsultaOrdemServicoRequestDTO,
  ): Observable<ConsultaOrdemServicoResponseDTO> {

    return this.http.post<ConsultaOrdemServicoResponseDTO>(
      `${this.baseUrl}/${encodeURIComponent(numero)}/consultar`,
      request,
    );
  }
}