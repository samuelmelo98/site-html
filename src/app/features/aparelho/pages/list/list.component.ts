import {
  DatePipe,
} from '@angular/common';

import {
  HttpErrorResponse,
} from '@angular/common/http';

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnChanges,
  SimpleChanges,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';

import {
  Router,
} from '@angular/router';

import {
  Subscription,
  finalize,
} from 'rxjs';

import {
  ButtonModule,
} from 'primeng/button';

import {
  Table,
  TableLazyLoadEvent,
  TableModule,
} from 'primeng/table';

import {
  TooltipModule,
} from 'primeng/tooltip';

import {
  AparelhoService,
} from '../../services/aparelho.service';

import {
  ClienteService,
} from '../../../cliente/services/cliente.service';

import {
  Cliente,
} from '../../../cliente/model/cliente-listar.dto';


import {
  OrdemServicoService,
} from '../../../ordem-servico/services/ordem-servico.service';

import {
  EditComponent,
} from '../edit/edit.component';


/*
 * MODELO UTILIZADO PELA LISTAGEM
 *
 * Mantido localmente porque a tela
 * precisa apenas destes campos.
 */
interface AparelhoLinha {

  aparelhoId: number;

  marcaId?: number | null;

  marca: string | null;

  modelo: string | null;

  modeloComercial: string | null;

  numeroSerie: string | null;

  statusAparelhoId?: number | null;

  statusAparelho?: string | null;

  dataEntradaAparelho?: string | null;

  observacao?: string | null;

  tipoAparelhoId?: number | null;

tipoAparelho?: string | null;
}


@Component({
  selector: 'app-aparelho-list',

  standalone: true,

  imports: [
    DatePipe,
    TableModule,
    ButtonModule,
    TooltipModule,
    EditComponent,
  ],

  templateUrl:
    './list.component.html',

  changeDetection:
    ChangeDetectionStrategy.OnPush,
})
export class ListComponent
  implements OnChanges {


  /*
   * DEPENDENCIAS
   */

  private readonly router =
    inject(Router);

  private readonly aparelhoService =
    inject(AparelhoService);

  private readonly clienteService =
    inject(ClienteService);

  private readonly ordemServicoService =
    inject(OrdemServicoService);

  private readonly destroyRef =
    inject(DestroyRef);


  /*
   * INPUT
   */

  readonly clienteId =
    input.required<number>();


  /*
   * CLIENTE
   */

  readonly cliente =
    signal<Cliente | null>(
      null,
    );

  readonly carregandoCliente =
    signal(false);

  readonly erroCliente =
    signal('');


  /*
   * EDICAO DO APARELHO
   */

  readonly modalEdicaoVisivel =
    signal(false);

  readonly aparelhoEdicaoId =
    signal<number | null>(
      null,
    );


  /*
   * APARELHOS
   */

  readonly dados2 =
    signal<AparelhoLinha[]>(
      [],
    );

  readonly total =
    signal(0);

  readonly loading =
    signal(false);

  readonly erro =
    signal('');


  /*
   * ORDEM DE SERVICO
   */

  readonly ordemEmProcessamento =
    signal<number | null>(
      null,
    );


  /*
   * TABELA
   */

  private readonly tabela =
    viewChild<Table>(
      'tabela',
    );


  /*
   * REQUISICOES
   */

  private requisicao?:
    Subscription;

  private requisicaoCliente?:
    Subscription;


  /*
   * BUSCA
   */

  private termoBusca =
    '';


  /*
   * ALTERACAO DO CLIENTE
   */

  ngOnChanges(
    changes: SimpleChanges,
  ): void {

    const alteracao =
      changes['clienteId'];


    if (!alteracao) {
      return;
    }


    this.carregarCliente();


    /*
     * A primeira consulta dos aparelhos
     * é disparada automaticamente pelo
     * lazy load da tabela.
     *
     * Se o cliente mudar depois,
     * reiniciamos a tabela.
     */
    if (
      !alteracao.firstChange
    ) {

      this.dados2.set(
        [],
      );

      this.total.set(
        0,
      );

      this.recarregar();
    }
  }


  /*
   * CARREGAR CLIENTE
   */

  carregarCliente(): void {

    this.requisicaoCliente
      ?.unsubscribe();


    const clienteId =
      this.clienteId();


    if (
      !Number.isSafeInteger(
        clienteId,
      ) ||
      clienteId <= 0
    ) {

      this.cliente.set(
        null,
      );

      this.erroCliente.set(
        'Identificador do cliente inválido.',
      );

      return;
    }


    this.carregandoCliente.set(
      true,
    );

    this.erroCliente.set(
      '',
    );


    this.requisicaoCliente =
      this.clienteService
        .buscarPorId(
          clienteId,
        )
        .pipe(

          finalize(
            () =>
              this.carregandoCliente.set(
                false,
              ),
          ),

          takeUntilDestroyed(
            this.destroyRef,
          ),

        )
        .subscribe({

          next: cliente => {

            this.cliente.set(
              cliente,
            );
          },


          error: (
            erro: HttpErrorResponse,
          ) => {

            this.cliente.set(
              null,
            );


            switch (
              erro.status
            ) {

              case 401:

                this.erroCliente.set(
                  'Sua sessão expirou. Entre novamente.',
                );

                break;


              case 403:

                this.erroCliente.set(
                  'Você não tem permissão para consultar este cliente.',
                );

                break;


              case 404:

                this.erroCliente.set(
                  'Cliente não encontrado.',
                );

                break;


              default:

                this.erroCliente.set(
                  'Não foi possível carregar os dados do cliente.',
                );
            }
          },

        });
  }


  /*
   * BUSCA
   */

  buscar(
    valor: string,
  ): void {

    this.termoBusca =
      valor.trim();

    this.recarregar();
  }


  /*
   * RECARREGAR TABELA
   */

  recarregar(): void {

    this.tabela()
      ?.reset();
  }


  /*
   * LISTAGEM PAGINADA
   */

  carregar(
    event: TableLazyLoadEvent,
  ): void {

    this.requisicao
      ?.unsubscribe();


    const clienteId =
      this.clienteId();


    if (
      !Number.isSafeInteger(
        clienteId,
      ) ||
      clienteId <= 0
    ) {

      this.dados2.set(
        [],
      );

      this.total.set(
        0,
      );

      this.erro.set(
        'Identificador do cliente inválido.',
      );

      return;
    }


    const size =
      Math.max(
        1,
        event.rows ?? 10,
      );


    const first =
      Math.max(
        0,
        event.first ?? 0,
      );


    const page =
      Math.floor(
        first / size,
      );


    const sortField =
      Array.isArray(
        event.sortField,
      )
        ? event.sortField[0] ||
          'aparelhoId'
        : event.sortField ||
          'aparelhoId';


    const sortOrder =
      event.sortOrder === -1
        ? 'desc'
        : 'asc';


    this.loading.set(
      true,
    );

    this.erro.set(
      '',
    );


    this.requisicao =
      this.aparelhoService
        .listarPaginado(
          page,
          size,
          sortField,
          sortOrder,
          this.termoBusca,
          clienteId,
        )
        .pipe(

          finalize(
            () =>
              this.loading.set(
                false,
              ),
          ),

          takeUntilDestroyed(
            this.destroyRef,
          ),

        )
        .subscribe({

          next: resposta => {

            /*
             * AparelhoResponse é estruturalmente
             * compatível com AparelhoLinha.
             */
            this.dados2.set(
              resposta.content,
            );

            this.total.set(
              resposta.totalElements,
            );
          },


          error: (
            erro: HttpErrorResponse,
          ) => {

            console.error(
              'Erro ao carregar aparelhos:',
              erro,
            );


            this.dados2.set(
              [],
            );

            this.total.set(
              0,
            );


            this.erro.set(
              erro.error?.detail ??
              erro.error?.message ??
              'Não foi possível carregar os aparelhos. Tente novamente.',
            );
          },

        });
  }


  /*
   * FORMATACAO DO TELEFONE
   */

  formatarTelefone(
    telefone:
      string |
      null |
      undefined,
  ): string {

    if (!telefone) {
      return '—';
    }


    const numeros =
      telefone.replace(
        /\D/g,
        '',
      );


    if (
      numeros.length === 11
    ) {

      return numeros.replace(
        /(\d{2})(\d{5})(\d{4})/,
        '($1) $2-$3',
      );
    }


    if (
      numeros.length === 10
    ) {

      return numeros.replace(
        /(\d{2})(\d{4})(\d{4})/,
        '($1) $2-$3',
      );
    }


    return telefone;
  }


  /*
   * TEXTO DO STATUS
   */

  textoStatus(
    status: unknown,
  ): string {

    if (
      typeof status ===
      'string'
    ) {

      return (
        status ||
        '—'
      );
    }


    if (
      typeof status ===
        'object' &&
      status !== null
    ) {

      if (
        'descricao' in status &&
        typeof status.descricao ===
          'string'
      ) {

        return status.descricao;
      }


      if (
        'nome' in status &&
        typeof status.nome ===
          'string'
      ) {

        return status.nome;
      }
    }


    return '—';
  }


  /*
   * EDITAR APARELHO
   */

  editarAparelho(
    aparelhoId: number,
  ): void {

    if (
      !Number.isSafeInteger(
        aparelhoId,
      ) ||
      aparelhoId <= 0
    ) {

      return;
    }


    this.aparelhoEdicaoId.set(
      aparelhoId,
    );

    this.modalEdicaoVisivel.set(
      true,
    );
  }


  /*
   * APARELHO ATUALIZADO
   */

  aparelhoAtualizado(): void {

  this.modalEdicaoVisivel.set(
    false,
  );

  this.aparelhoEdicaoId.set(
    null,
  );

  this.recarregar();
}

  /*
   * NOVA ORDEM DE SERVICO
   *
   * Este método cria uma nova OS.
   */

  novaOrdemServico(
    aparelhoId: number,
  ): void {

    if (
      this.ordemEmProcessamento() !==
      null
    ) {

      return;
    }


    if (
      !Number.isSafeInteger(
        aparelhoId,
      ) ||
      aparelhoId <= 0
    ) {

      this.erro.set(
        'Identificador do aparelho inválido.',
      );

      return;
    }


    this.ordemEmProcessamento.set(
      aparelhoId,
    );

    this.erro.set(
      '',
    );


    this.ordemServicoService
      .abrir(
        aparelhoId,
      )
      .pipe(

        finalize(
          () =>
            this.ordemEmProcessamento.set(
              null,
            ),
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),

      )
      .subscribe({

        next: ordem => {

          void this.router.navigate(
            [
              '/ordem-servico',
              ordem.ordemServicoId,
            ],
            {
              state: {
                ordem,
              },
            },
          );
        },


        error: (
          erro: HttpErrorResponse,
        ) => {

          console.error(
            'Erro ao criar nova OS:',
            erro,
          );


          this.erro.set(
            erro.error?.detail ??
            erro.error?.message ??
            'Não foi possível criar a ordem de serviço.',
          );
        },

      });
  }


  /*
   * VER ULTIMA ORDEM DE SERVICO
   *
   * Este método NÃO cria uma nova OS
   * caso já exista uma.
   */

  verOrdemServico(
    aparelhoId: number,
  ): void {

    if (
      !Number.isSafeInteger(
        aparelhoId,
      ) ||
      aparelhoId <= 0
    ) {

      this.erro.set(
        'Identificador do aparelho inválido.',
      );

      return;
    }


    this.erro.set(
      '',
    );


    this.ordemServicoService
      .buscarUltimaPorAparelho(
        aparelhoId,
      )
      .pipe(

        takeUntilDestroyed(
          this.destroyRef,
        ),

      )
      .subscribe({

        next: ordem => {

          if (!ordem) {

            this.gerarOrdemServico(
              aparelhoId,
            );

            return;
          }


          void this.router.navigate(
            [
              '/ordem-servico',
              ordem.ordemServicoId,
            ],
            {
              state: {
                ordem,
              },
            },
          );
        },


        error: (
          erro: HttpErrorResponse,
        ) => {

          console.error(
            'Erro ao consultar OS:',
            erro,
          );


          this.erro.set(
            erro.error?.detail ??
            erro.error?.message ??
            'Não foi possível consultar a ordem de serviço.',
          );
        },

      });
  }


  /*
   * GERAR ORDEM DE SERVICO
   *
   * Chamado quando ainda não existe
   * uma OS para o aparelho.
   */

  gerarOrdemServico(
    aparelhoId: number,
  ): void {

    if (
      !Number.isSafeInteger(
        aparelhoId,
      ) ||
      aparelhoId <= 0
    ) {

      this.erro.set(
        'Identificador do aparelho inválido.',
      );

      return;
    }


    this.erro.set(
      '',
    );


    this.ordemServicoService
      .abrir(
        aparelhoId,
      )
      .pipe(

        takeUntilDestroyed(
          this.destroyRef,
        ),

      )
      .subscribe({

        next: ordem => {

          void this.router.navigate(
            [
              '/ordem-servico',
              ordem.ordemServicoId,
            ],
            {
              state: {
                ordem,
              },
            },
          );
        },


        error: (
          erro: HttpErrorResponse,
        ) => {

          console.error(
            'Erro ao gerar OS:',
            erro,
          );


          this.erro.set(
            erro.error?.detail ??
            erro.error?.message ??
            'Não foi possível gerar a ordem de serviço.',
          );
        },

      });
  }
}