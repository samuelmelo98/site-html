import {
  CurrencyPipe,
  DatePipe,
} from '@angular/common';

import {
  HttpErrorResponse,
} from '@angular/common/http';

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
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
  ConfirmationService,
  MessageService,
} from 'primeng/api';

import {
  ButtonModule,
} from 'primeng/button';

import {
  ConfirmDialogModule,
} from 'primeng/confirmdialog';

import {
  Table,
  TableLazyLoadEvent,
  TableModule,
} from 'primeng/table';

import {
  TagModule,
} from 'primeng/tag';

import {
  TooltipModule,
} from 'primeng/tooltip';

import {
  StatusVenda,
  VendaResponseDTO,
} from '../../model/venda.dto';

import {
  VendaService,
} from '../../services/venda.service';

type TagSeverity =
  | 'success'
  | 'secondary'
  | 'info'
  | 'warn'
  | 'danger'
  | 'contrast';

@Component({
  selector: 'app-venda-list',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    ButtonModule,
    ConfirmDialogModule,
    TableModule,
    TagModule,
    TooltipModule,
  ],
  providers: [
    ConfirmationService,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
  changeDetection:
    ChangeDetectionStrategy.OnPush,
})
export class ListComponent {

  private readonly router =
    inject(Router);

  private readonly vendaService =
    inject(VendaService);

  private readonly messageService =
    inject(MessageService);

  private readonly confirmationService =
    inject(ConfirmationService);

  private readonly destroyRef =
    inject(DestroyRef);

  readonly vendas =
    signal<VendaResponseDTO[]>([]);

  readonly total =
    signal(0);

  readonly loading =
    signal(false);

  readonly erro =
    signal('');

  readonly processandoVendaId =
    signal<number | null>(null);

  private readonly tabela =
    viewChild<Table>('tabela');

  private requisicao?:
    Subscription;

  novaVenda(): void {
    this.router.navigate(
      ['/vendas/nova'],
    );
  }

  visualizar(
    vendaId: number,
  ): void {

    this.router.navigate(
      ['/vendas', vendaId],
    );
  }

  editar(
    vendaId: number,
  ): void {

    this.router.navigate(
      [
        '/vendas',
        vendaId,
        'editar',
      ],
    );
  }

  recarregar(): void {
    this.tabela()?.reset();
  }

  carregar(
    event: TableLazyLoadEvent,
  ): void {

    this.requisicao
      ?.unsubscribe();

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
      typeof event.sortField === 'string'
        ? event.sortField
        : 'dataVenda';

    const direction =
      event.sortOrder === 1
        ? 'asc'
        : 'desc';

    this.loading.set(true);
    this.erro.set('');

    this.requisicao =
      this.vendaService
        .listar(
          page,
          size,
          `${sortField},${direction}`,
        )
        .pipe(
          finalize(
            () =>
              this.loading.set(false),
          ),
          takeUntilDestroyed(
            this.destroyRef,
          ),
        )
        .subscribe({
          next: pagina => {
            this.vendas.set(
              pagina.content ?? [],
            );

            this.total.set(
              pagina.totalElements ?? 0,
            );
          },

          error: (
            erro: HttpErrorResponse,
          ) => {

            this.vendas.set([]);
            this.total.set(0);

            this.erro.set(
              this.mensagemErro(
                erro,
                'Não foi possível consultar as vendas.',
              ),
            );
          },
        });
  }

  confirmarFinalizacao(
    venda: VendaResponseDTO,
  ): void {

    if (
      venda.status !== 'ABERTA' ||
      this.processandoVendaId() !== null
    ) {
      return;
    }

    this.confirmationService.confirm({
      header: 'Finalizar venda',
      icon: 'pi pi-check-circle',
      message:
        `Deseja finalizar a venda ${venda.numero}?`,
      acceptLabel: 'Finalizar',
      rejectLabel: 'Voltar',
      acceptButtonStyleClass:
        'p-button-success',
      accept: () =>
        this.finalizar(
          venda.vendaId,
        ),
    });
  }

  confirmarCancelamento(
    venda: VendaResponseDTO,
  ): void {

    if (
      venda.status === 'CANCELADA' ||
      this.processandoVendaId() !== null
    ) {
      return;
    }

    this.confirmationService.confirm({
      header: 'Cancelar venda',
      icon: 'pi pi-exclamation-triangle',
      message:
        `Deseja cancelar a venda ${venda.numero}?`,
      acceptLabel: 'Cancelar venda',
      rejectLabel: 'Voltar',
      acceptButtonStyleClass:
        'p-button-danger',
      accept: () =>
        this.cancelar(
          venda.vendaId,
        ),
    });
  }

  textoStatus(
    status: StatusVenda,
  ): string {

    switch (status) {
      case 'ABERTA':
        return 'Aberta';

      case 'FINALIZADA':
        return 'Finalizada';

      case 'CANCELADA':
        return 'Cancelada';

      default:
        return status;
    }
  }

  severityStatus(
    status: StatusVenda,
  ): TagSeverity {

    switch (status) {
      case 'ABERTA':
        return 'warn';

      case 'FINALIZADA':
        return 'success';

      case 'CANCELADA':
        return 'danger';

      default:
        return 'secondary';
    }
  }

  private finalizar(
    vendaId: number,
  ): void {

    this.processandoVendaId.set(
      vendaId,
    );

    this.vendaService
      .finalizar(vendaId)
      .pipe(
        finalize(
          () =>
            this.processandoVendaId.set(
              null,
            ),
        ),
        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe({
        next: venda => {
          this.messageService.add({
            severity: 'success',
            summary: 'Venda finalizada',
            detail:
              `A venda ${venda.numero} foi finalizada.`,
          });

          this.recarregar();
        },

        error: (
          erro: HttpErrorResponse,
        ) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail:
              this.mensagemErro(
                erro,
                'Não foi possível finalizar a venda.',
              ),
          });
        },
      });
  }

  private cancelar(
    vendaId: number,
  ): void {

    this.processandoVendaId.set(
      vendaId,
    );

    this.vendaService
      .cancelar(vendaId)
      .pipe(
        finalize(
          () =>
            this.processandoVendaId.set(
              null,
            ),
        ),
        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe({
        next: venda => {
          this.messageService.add({
            severity: 'success',
            summary: 'Venda cancelada',
            detail:
              `A venda ${venda.numero} foi cancelada.`,
          });

          this.recarregar();
        },

        error: (
          erro: HttpErrorResponse,
        ) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail:
              this.mensagemErro(
                erro,
                'Não foi possível cancelar a venda.',
              ),
          });
        },
      });
  }

  private mensagemErro(
    erro: HttpErrorResponse,
    padrao: string,
  ): string {

    const mensagem =
      erro.error?.message ??
      erro.error?.mensagem ??
      erro.error?.detail;

    if (
      typeof mensagem === 'string' &&
      mensagem.trim()
    ) {
      return mensagem;
    }

    switch (erro.status) {
      case 401:
        return 'Sua sessão expirou. Entre novamente.';

      case 403:
        return 'Você não tem permissão para executar esta operação.';

      case 404:
        return 'Venda não encontrada.';

      case 409:
        return padrao;

      default:
        return padrao;
    }
  }

  emitirCupom(
    venda: VendaResponseDTO,
  ): void {

    if (
      venda.status !== 'FINALIZADA'
    ) {

      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail:
          'Somente vendas finalizadas podem emitir o cupom.',
      });

      return;
    }

    /*
     * Abrimos a janela antes da requisição.
     *
     * Isso evita que o navegador bloqueie
     * a nova aba como popup.
     */
    const janela =
      window.open(
        '',
        '_blank',
      );

    if (!janela) {

      this.messageService.add({
        severity: 'warn',
        summary: 'Popup bloqueado',
        detail:
          'Permita popups para imprimir o cupom.',
      });

      return;
    }

    janela.document.write(
      `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Carregando cupom...</title>
          </head>

          <body
            style="
              font-family: Arial, sans-serif;
              padding: 20px;
            "
          >
            Carregando cupom...
          </body>
        </html>
      `,
    );

    janela.document.close();

    this.vendaService
      .emitirCupom(
        venda.vendaId,
      )
      .subscribe({

        next: html => {

          janela.document.open();

          janela.document.write(
            html,
          );

          janela.document.close();

          janela.focus();

          setTimeout(
            () => {
              janela.print();
            },
            300,
          );
        },

        error: (
          erro: HttpErrorResponse,
        ) => {

          janela.close();

          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail:
              erro.error?.detail ??
              erro.error?.message ??
              'Não foi possível emitir o cupom.',
          });
        },

      });
  }
}
