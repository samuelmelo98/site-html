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
  RelatorioSemanalTecnicoDTO,
} from '../model/relatorio-semanal-tecnico.dto';

@Injectable({
  providedIn: 'root',
})
export class RelatorioSemanalTecnicoService {

  private readonly http =
    inject(HttpClient);

  private readonly baseUrl =
    `${environment.apiUrl}/relatorios/tecnicos`;


  buscarSemanal(
    tecnicoId?: number | null,
  ): Observable<RelatorioSemanalTecnicoDTO[]> {

    let params =
      new HttpParams();

    if (tecnicoId !== null &&
        tecnicoId !== undefined) {

      params =
        params.set(
          'tecnicoId',
          tecnicoId,
        );
    }

    return this.http.get<RelatorioSemanalTecnicoDTO[]>(
      `${this.baseUrl}/semanal`,
      {
        params,
      },
    );
  }


  buscarPorPeriodo(
    inicio: string,
    fim: string,
    tecnicoId?: number | null,
  ): Observable<RelatorioSemanalTecnicoDTO[]> {

    let params =
      new HttpParams()
        .set(
          'inicio',
          inicio,
        )
        .set(
          'fim',
          fim,
        );

    if (tecnicoId !== null &&
        tecnicoId !== undefined) {

      params =
        params.set(
          'tecnicoId',
          tecnicoId,
        );
    }

    return this.http.get<RelatorioSemanalTecnicoDTO[]>(
      this.baseUrl,
      {
        params,
      },
    );
  }
}
