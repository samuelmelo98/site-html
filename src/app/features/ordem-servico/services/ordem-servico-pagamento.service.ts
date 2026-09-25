import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

export type FormaPagamento =
  | 'DINHEIRO'
  | 'PIX'
  | 'CARTAO_DEBITO'
  | 'CARTAO_CREDITO'
  | 'TRANSFERENCIA';

export type StatusPagamento =
  | 'ATIVO'
  | 'CANCELADO';

export interface OrdemServicoPagamentoCreateDTO {
  formaPagamento: FormaPagamento;
  valor: number;
  parcelas: number;
  observacao?: string | null;
}

export interface OrdemServicoPagamentoDTO {
  pagamentoId: number;
  ordemServicoId: number;
  formaPagamento: FormaPagamento;
  valor: number;
  parcelas: number;
  observacao: string | null;
  status: StatusPagamento;
  dataPagamento: string;
  dataCancelamento: string | null;
}

export interface OrdemServicoPagamentoResumoDTO {
  ordemServicoId: number;
  valorOrdemServico: number;
  totalPago: number;
  saldoPendente: number;
  quitado: boolean;
  pagamentos: OrdemServicoPagamentoDTO[];
}

@Injectable({
  providedIn: 'root',
})
export class OrdemServicoPagamentoService {

  private readonly http = inject(HttpClient);

  private readonly baseUrl =
    `${environment.apiUrl}/ordens-servico`;

  buscarResumo(
    ordemServicoId: number,
  ): Observable<OrdemServicoPagamentoResumoDTO> {

    return this.http.get<OrdemServicoPagamentoResumoDTO>(
      `${this.baseUrl}/${ordemServicoId}/pagamentos`,
    );
  }

  adicionar(
    ordemServicoId: number,
    dto: OrdemServicoPagamentoCreateDTO,
  ): Observable<OrdemServicoPagamentoDTO> {

    return this.http.post<OrdemServicoPagamentoDTO>(
      `${this.baseUrl}/${ordemServicoId}/pagamentos`,
      dto,
    );
  }

  cancelar(
    ordemServicoId: number,
    pagamentoId: number,
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.baseUrl}/${ordemServicoId}/pagamentos/${pagamentoId}`,
    );
  }
}
