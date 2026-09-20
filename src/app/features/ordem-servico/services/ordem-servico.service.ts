import {
  inject,
  Injectable,
} from '@angular/core';

import {
  HttpClient,
} from '@angular/common/http';

import {
  Observable,
} from 'rxjs';

import {
  environment,
} from '../../../../environments/environment';

import {
  OrdemServicoDetalheDTO,
} from '../model/ordem-servico-detalhe.dto';

import {
  OrdemServicoOrcamentoRequestDTO,
  OrdemServicoOrcamentoResponseDTO,
} from '../model/ordem-servico-orcamento.dto';

export interface AbrirOrdemServicoRequest {
  aparelhoId: number;
}


export interface ConcluirOrdemServicoRequest {
  solucao: string;
  valorFinal?: number;
  observacao?: string;
}


@Injectable({
  providedIn: 'root',
})
export class OrdemServicoService {

  private readonly http =
    inject(HttpClient);

  private readonly API =
    `${environment.apiUrl}/ordens-servico`;


  /**
   * Cria uma nova OS ou retorna
   * uma OS ativa existente para o aparelho.
   */
  abrir(
    aparelhoId: number,
  ): Observable<OrdemServicoDetalheDTO> {

    const request:
      AbrirOrdemServicoRequest = {
        aparelhoId,
      };

    return this.http.post<OrdemServicoDetalheDTO>(
      this.API,
      request,
    );
  }


  /**
   * Busca uma ordem de servico pelo ID.
   */
  buscarPorId(
    ordemServicoId: number,
  ): Observable<OrdemServicoDetalheDTO> {

    return this.http.get<OrdemServicoDetalheDTO>(
      `${this.API}/${ordemServicoId}`,
    );
  }


  /**
   * Retorna o HTML utilizado para impressao.
   */
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


  /**
   * ABERTA -> EM_ANALISE
   */
  iniciarAnalise(
    ordemServicoId: number,
  ): Observable<OrdemServicoDetalheDTO> {

    return this.http.post<OrdemServicoDetalheDTO>(
      `${this.API}/${ordemServicoId}/iniciar-analise`,
      {},
    );
  }


  /**
   * APROVADA -> EM_EXECUCAO
   *
   * O backend deve validar:
   *
   * - orcamento aprovado
   * - tecnico responsavel
   */
  iniciarExecucao(
    ordemServicoId: number,
  ): Observable<OrdemServicoDetalheDTO> {

    return this.http.post<OrdemServicoDetalheDTO>(
      `${this.API}/${ordemServicoId}/iniciar-execucao`,
      {},
    );
  }


  /**
   * EM_EXECUCAO -> CONCLUIDA
   */
  concluir(
    ordemServicoId: number,
    request: ConcluirOrdemServicoRequest,
  ): Observable<OrdemServicoDetalheDTO> {

    return this.http.post<OrdemServicoDetalheDTO>(
      `${this.API}/${ordemServicoId}/concluir`,
      request,
    );
  }


  /**
   * CONCLUIDA -> ENTREGUE
   */
  entregar(
    ordemServicoId: number,
  ): Observable<OrdemServicoDetalheDTO> {

    return this.http.post<OrdemServicoDetalheDTO>(
      `${this.API}/${ordemServicoId}/entregar`,
      {},
    );
  }


  /**
   * Abre o documento e chama a impressao
   * do navegador.
   */
  imprimir(
    ordemServicoId: number,
  ): void {

    const janela =
      window.open(
        '',
        '_blank',
      );

    if (!janela) {
      return;
    }

    janela.document.open();

    janela.document.write(`
      <!doctype html>

      <html lang="pt-BR">

        <head>
          <meta charset="utf-8">

          <title>
            Carregando ordem de servico...
          </title>
        </head>

        <body
          style="
            font-family: Arial, sans-serif;
            padding: 30px;
          "
        >
          Carregando ordem de servico...
        </body>

      </html>
    `);

    janela.document.close();


    this.gerarDocumento(
      ordemServicoId,
    )
      .subscribe({

        next: html => {

          janela.document.open();

          janela.document.write(
            html,
          );

          janela.document.close();


          setTimeout(
            () => {

              janela.focus();

              janela.print();

            },
            500,
          );

        },


        error: () => {

          janela.document.open();

          janela.document.write(`
            <!doctype html>

            <html lang="pt-BR">

              <head>
                <meta charset="utf-8">

                <title>
                  Erro
                </title>
              </head>

              <body
                style="
                  font-family: Arial, sans-serif;
                  padding: 30px;
                "
              >

                <h2>
                  Nao foi possivel gerar
                  a ordem de servico.
                </h2>

              </body>

            </html>
          `);

          janela.document.close();

        },

      });
  }

  salvarOrcamentoRascunho(
  ordemServicoId: number,
  request: OrdemServicoOrcamentoRequestDTO,
): Observable<OrdemServicoOrcamentoResponseDTO> {

  return this.http.post<OrdemServicoOrcamentoResponseDTO>(
    `${this.API}/${ordemServicoId}/orcamentos`,
    request,
  );
}

buscarOrcamentoAtual(
  ordemServicoId: number,
): Observable<OrdemServicoOrcamentoResponseDTO | null> {

  return this.http.get<OrdemServicoOrcamentoResponseDTO | null>(
    `${this.API}/${ordemServicoId}/orcamentos/atual`,
  );
}

enviarOrcamentoParaAprovacao(
  ordemServicoId: number,
  orcamentoId: number,
): Observable<OrdemServicoOrcamentoResponseDTO> {

  return this.http.post<OrdemServicoOrcamentoResponseDTO>(
    `${this.API}/${ordemServicoId}/orcamentos/${orcamentoId}/enviar`,
    {},
  );
}

aprovarOrcamento(
  ordemServicoId: number,
  orcamentoId: number,
): Observable<OrdemServicoOrcamentoResponseDTO> {

  return this.http.post<OrdemServicoOrcamentoResponseDTO>(
    `${this.API}/${ordemServicoId}/orcamentos/${orcamentoId}/aprovar`,
    {},
  );
}


reprovarOrcamento(
  ordemServicoId: number,
  orcamentoId: number,
): Observable<OrdemServicoOrcamentoResponseDTO> {

  return this.http.post<OrdemServicoOrcamentoResponseDTO>(
    `${this.API}/${ordemServicoId}/orcamentos/${orcamentoId}/reprovar`,
    {},
  );
}

atribuirTecnico(
  ordemServicoId: number,
  tecnicoId: number,
): Observable<OrdemServicoDetalheDTO> {

  return this.http.post<OrdemServicoDetalheDTO>(
    `${this.API}/${ordemServicoId}/atribuir-tecnico`,
    {
      tecnicoId,
    },
  );
}

buscarUltimaPorAparelho(
  aparelhoId: number,
): Observable<OrdemServicoDetalheDTO | null> {

  return this.http.get<
    OrdemServicoDetalheDTO | null
  >(
    `${this.API}/aparelho/${aparelhoId}/ultima`,
  );
}


}