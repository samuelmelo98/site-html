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
  DashboardOrdemServicoDTO,
} from '../model/dashboard-ordem-servico.dto';


import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {

  private readonly http =
    inject(HttpClient);

  private readonly baseUrl =
    `${environment.apiUrl}/dashboard`;


  buscarMetricasOrdensServico():
    Observable<DashboardOrdemServicoDTO> {

    return this.http.get<DashboardOrdemServicoDTO>(
      `${this.baseUrl}/ordens-servico`,
    );

  }

}