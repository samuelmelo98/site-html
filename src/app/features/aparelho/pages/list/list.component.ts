import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

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

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  Subscription,
  finalize,
} from 'rxjs';

import { ButtonModule } from 'primeng/button';

import {
  Table,
  TableLazyLoadEvent,
  TableModule,
} from 'primeng/table';

import { TooltipModule } from 'primeng/tooltip';

import { AparelhoService } from '../../services/aparelho.service';

import { ClienteService } from '../../../cliente/services/cliente.service';
import { Cliente } from '../../../cliente/model/cliente-listar.dto';

import { CpfPipe } from '../../../../shared/pipes/cpf.pipe';


import { OrdemServicoService } from '../../services/features/ordem-servico/services/ordem-servico.service';

interface AparelhoLinha {
  aparelhoId: number;
  marca: string;
  modelo: string | null;
  modeloComercial: string | null;
  numeroSerie: string | null;
  statusAparelho?: unknown;
  dataEntradaAparelho?: string | null;
  dataCadastro?: string | null;
}

@Component({
  selector: 'app-aparelho-list',
  standalone: true,
  imports: [
    DatePipe,
    CpfPipe,
    TableModule,
    ButtonModule,
    TooltipModule,
  ],
  templateUrl: './list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnChanges {

readonly ordemEmProcessamento =
  signal<number | null>(null);

private readonly ordemServicoService =
  inject(OrdemServicoService);

  readonly clienteId = input.required<number>();

  readonly cliente = signal<Cliente | null>(null);
  readonly carregandoCliente = signal(false);
  readonly erroCliente = signal('');

  readonly dados2 = signal<AparelhoLinha[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly erro = signal('');

  private readonly aparelhoService =
    inject(AparelhoService);

  private readonly clienteService =
    inject(ClienteService);

  private readonly destroyRef =
    inject(DestroyRef);

  private readonly tabela =
    viewChild<Table>('tabela');

  private requisicao?: Subscription;
  private requisicaoCliente?: Subscription;

  private termoBusca = '';

  ngOnChanges(
    changes: SimpleChanges,
  ): void {
    const alteracao = changes['clienteId'];

    if (!alteracao) {
      return;
    }

    this.carregarCliente();

    /*
     * A primeira consulta dos aparelhos é disparada
     * automaticamente pelo lazy load da tabela.
     *
     * Se o cliente mudar depois, reiniciamos a tabela.
     */
    if (!alteracao.firstChange) {
      this.dados2.set([]);
      this.total.set(0);
      this.recarregar();
    }
  }

  carregarCliente(): void {
    this.requisicaoCliente?.unsubscribe();

    const clienteId = this.clienteId();

    if (
      !Number.isSafeInteger(clienteId) ||
      clienteId <= 0
    ) {
      this.cliente.set(null);
      this.erroCliente.set(
        'Identificador do cliente inválido.',
      );
      return;
    }

    this.carregandoCliente.set(true);
    this.erroCliente.set('');

    this.requisicaoCliente =
      this.clienteService
        .buscarPorId(clienteId)
        .pipe(
          finalize(() =>
            this.carregandoCliente.set(false),
          ),
          takeUntilDestroyed(
            this.destroyRef,
          ),
        )
        .subscribe({
          next: cliente => {
            this.cliente.set(cliente);
          },

          error: (
            erro: HttpErrorResponse,
          ) => {
            this.cliente.set(null);

            switch (erro.status) {
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

  buscar(valor: string): void {
    this.termoBusca = valor.trim();
    this.recarregar();
  }

  recarregar(): void {
    this.tabela()?.reset();
  }

  carregar(
    event: TableLazyLoadEvent,
  ): void {
    this.requisicao?.unsubscribe();

    const clienteId =
      this.clienteId();

    if (
      !Number.isSafeInteger(clienteId) ||
      clienteId <= 0
    ) {
      this.dados2.set([]);
      this.total.set(0);
      this.erro.set(
        'Identificador do cliente inválido.',
      );
      return;
    }

    const size = Math.max(
      1,
      event.rows ?? 10,
    );

    const first = Math.max(
      0,
      event.first ?? 0,
    );

    const page =
      Math.floor(first / size);

    const sortField =
      Array.isArray(event.sortField)
        ? event.sortField[0] ||
          'aparelhoId'
        : event.sortField ||
          'aparelhoId';

    const sortOrder =
      event.sortOrder === -1
        ? 'desc'
        : 'asc';

    this.loading.set(true);
    this.erro.set('');

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
          finalize(() =>
            this.loading.set(false),
          ),
          takeUntilDestroyed(
            this.destroyRef,
          ),
        )
        .subscribe({
          next: resposta => {
            this.dados2.set(
              resposta.content,
            );

            this.total.set(
              resposta.totalElements,
            );
          },

          error: () => {
            this.dados2.set([]);
            this.total.set(0);

            this.erro.set(
              'Não foi possível carregar os aparelhos. Tente novamente.',
            );
          },
        });
  }

  formatarTelefone(
    telefone: string | null | undefined,
  ): string {
    if (!telefone) {
      return '—';
    }

    const numeros =
      telefone.replace(/\D/g, '');

    if (numeros.length === 11) {
      return numeros.replace(
        /(\d{2})(\d{5})(\d{4})/,
        '($1) $2-$3',
      );
    }

    if (numeros.length === 10) {
      return numeros.replace(
        /(\d{2})(\d{4})(\d{4})/,
        '($1) $2-$3',
      );
    }

    return telefone;
  }

  textoStatus(
    status: unknown,
  ): string {
    if (
      typeof status === 'string'
    ) {
      return status || '—';
    }

    if (
      typeof status === 'object' &&
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

  abrirOrdemServico(
  aparelhoId: number,
): void {

  if (
    this.ordemEmProcessamento() !== null
  ) {
    return;
  }

  /*
   * Abrimos a janela imediatamente.
   * Isso evita bloqueio de popup porque a abertura
   * ainda acontece diretamente pelo clique do usuário.
   */
  const janela =
    window.open(
      '',
      '_blank',
    );

  if (!janela) {
    this.erro.set(
      'O navegador bloqueou a abertura da ordem de serviço.',
    );
    return;
  }

  janela.document.open();

  janela.document.write(`
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <title>Ordem de Serviço</title>
      </head>
      <body style="
        font-family: Arial, sans-serif;
        padding: 30px;
      ">
        Carregando ordem de serviço...
      </body>
    </html>
  `);

  janela.document.close();

  this.ordemEmProcessamento.set(
    aparelhoId,
  );

  this.ordemServicoService
    .abrir(aparelhoId)
    .pipe(
      finalize(() =>
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

        this.ordemServicoService
          .gerarDocumento(
            ordem.ordemServicoId,
          )
          .pipe(
            takeUntilDestroyed(
              this.destroyRef,
            ),
          )
          .subscribe({
            next: html => {

              janela.document.open();

              janela.document.write(
                html,
              );

              janela.document.close();

              /*
               * Aguarda o documento e eventuais
               * imagens terminarem de renderizar.
               */
              setTimeout(() => {
                janela.focus();
                janela.print();
              }, 500);
            },

            error: () => {

              janela.document.open();

              janela.document.write(`
                <html>
                  <body style="
                    font-family: Arial;
                    padding: 30px;
                  ">
                    <h2>
                      Não foi possível gerar
                      a ordem de serviço.
                    </h2>
                  </body>
                </html>
              `);

              janela.document.close();
            },
          });
      },

      error: (
        erro: HttpErrorResponse,
      ) => {

        janela.document.open();

        janela.document.write(`
          <html>
            <body style="
              font-family: Arial;
              padding: 30px;
            ">
              <h2>
                Não foi possível abrir
                a ordem de serviço.
              </h2>

              <p>
                ${
                  erro.error?.detail ??
                  'Erro ao processar a solicitação.'
                }
              </p>
            </body>
          </html>
        `);

        janela.document.close();
      },
    });
}
}