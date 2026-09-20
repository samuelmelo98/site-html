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


import { environment } from '../../../../../../../environments/environment';

import { AbrirOrdemServicoRequest } from '../../../../model/ordem-servico.dto';

import { OrdemServico } from '../../../../model/ordem-servico.dto';

@Injectable({
  providedIn: 'root',
})
export class OrdemServicoService {

  private readonly http =
    inject(HttpClient);

  private readonly API =
    `${environment.apiUrl}/ordens-servico`;

  abrir(
    aparelhoId: number,
  ): Observable<OrdemServico> {

    const request:
      AbrirOrdemServicoRequest = {
        aparelhoId,
      };

    return this.http.post<OrdemServico>(
      this.API,
      request,
    );
  }

  buscarPorId(
    ordemServicoId: number,
  ): Observable<OrdemServico> {

    return this.http.get<OrdemServico>(
      `${this.API}/${ordemServicoId}`,
    );
  }

  gerarDocumento(
    ordemServicoId: number,
  ): Observable<string> {

    return this.http.get(
      `${this.API}/${ordemServicoId}/documento`,
      {
        responseType: 'text',
      },
    );
  }
}