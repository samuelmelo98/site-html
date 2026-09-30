import {
  inject,
  Injectable,
} from '@angular/core';

import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';

import {
  Observable,
} from 'rxjs';

import {
  environment,
} from '../../../../environments/environment';

import {
  PageResponse,
  VendaDetalheDTO,
  VendaRequestDTO,
  VendaResponseDTO,
} from '../model/venda.dto';

@Injectable({
  providedIn: 'root',
})
export class VendaService {

  private readonly http =
    inject(HttpClient);

  private readonly baseUrl =
    `${environment.apiUrl}/vendas`;

  listar(
    page: number,
    size: number,
    sort = 'dataVenda,desc',
  ): Observable<PageResponse<VendaResponseDTO>> {

    const params =
      new HttpParams()
        .set(
          'page',
          page,
        )
        .set(
          'size',
          size,
        )
        .set(
          'sort',
          sort,
        );

    return this.http
      .get<PageResponse<VendaResponseDTO>>(
        this.baseUrl,
        {
          params,
        },
      );
  }

  buscar(
    vendaId: number,
  ): Observable<VendaDetalheDTO> {

    return this.http
      .get<VendaDetalheDTO>(
        `${this.baseUrl}/${vendaId}`,
      );
  }

  criar(
    dto: VendaRequestDTO,
  ): Observable<VendaDetalheDTO> {

    return this.http
      .post<VendaDetalheDTO>(
        this.baseUrl,
        dto,
      );
  }

  atualizar(
    vendaId: number,
    dto: VendaRequestDTO,
  ): Observable<VendaDetalheDTO> {

    return this.http
      .put<VendaDetalheDTO>(
        `${this.baseUrl}/${vendaId}`,
        dto,
      );
  }

  finalizar(
    vendaId: number,
  ): Observable<VendaDetalheDTO> {

    return this.http
      .post<VendaDetalheDTO>(
        `${this.baseUrl}/${vendaId}/finalizar`,
        {},
      );
  }

  cancelar(
    vendaId: number,
  ): Observable<VendaDetalheDTO> {

    return this.http
      .post<VendaDetalheDTO>(
        `${this.baseUrl}/${vendaId}/cancelar`,
        {},
      );
  }

}