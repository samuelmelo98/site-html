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
  OnInit,
  inject,
  signal,
} from '@angular/core';

import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';

import {
  ActivatedRoute,
  Router,
} from '@angular/router';

import {
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
  ProgressSpinnerModule,
} from 'primeng/progressspinner';

import {
  TableModule,
} from 'primeng/table';

import {
  TagModule,
} from 'primeng/tag';

import {
  StatusVenda,
  VendaDetalheDTO,
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
  selector: 'app-venda-detail',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    ButtonModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    TableModule,
    TagModule,
  ],
  providers: [
    ConfirmationService,
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css',
  changeDetection:
    ChangeDetectionStrategy.OnPush,
})
export class DetailComponent
  implements OnInit {

  private readonly vendaService =
    inject(VendaService);

  private readonly messageService =
    inject(MessageService);

  private readonly confirmationService =
    inject(ConfirmationService);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly destroyRef =
    inject(DestroyRef);

  readonly venda =
    signal<VendaDetalheDTO | null>(
      null,
    );

  readonly carregando =
    signal(false);

  readonly processando =
    signal(false);

  readonly erro =
    signal('');

  ngOnInit(): void {

    const parametro =
      this.route.snapshot.paramMap.get(
        'vendaId',
      );

    if (
      parametro === null ||
      !/^[1-9]\d*$/.test(parametro)
    ) {
      this.erro.set(
        'Identificador da venda inválido.',
      );
      return;
    }

    const vendaId =
      Number(parametro);

    if (
      !Number.isSafeInteger(
        vendaId,
      )
    ) {
      this.erro.set(
        'Identificador da venda inválido.',
      );
      return;
    }

    this.carregar(
      vendaId,
    );
  }

  editar(): void {

    const venda =
      this.venda();

    if (
      !venda ||
      venda.status !== 'ABERTA'
    ) {
      return;
    }

    this.router.navigate(
      [
        '/vendas',
        venda.vendaId,
        'editar',
      ],
    );
  }

  voltar(): void {

    this.router.navigate(
      ['/vendas/listar'],
    );
  }

  confirmarFinalizacao(): void {

    const venda =
      this.venda();

    if (
      !venda ||
      venda.status !== 'ABERTA' ||
      this.processando()
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

  confirmarCancelamento(): void {

    const venda =
      this.venda();

    if (
      !venda ||
      venda.status === 'CANCELADA' ||
      this.processando()
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

  private carregar(
    vendaId: number,
  ): void {

    this.carregando.set(true);
    this.erro.set('');

    this.vendaService
      .buscar(
        vendaId,
      )
      .pipe(
        finalize(
          () =>
            this.carregando.set(
              false,
            ),
        ),
        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe({
        next: venda => {
          this.venda.set(
            venda,
          );
        },

        error: (
          erro: HttpErrorResponse,
        ) => {

          this.venda.set(null);

          this.erro.set(
            this.mensagemErro(
              erro,
              'Não foi possível carregar a venda.',
            ),
          );
        },
      });
  }

  private finalizar(
    vendaId: number,
  ): void {

    this.processando.set(true);

    this.vendaService
      .finalizar(
        vendaId,
      )
      .pipe(
        finalize(
          () =>
            this.processando.set(
              false,
            ),
        ),
        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe({
        next: venda => {

          this.venda.set(
            venda,
          );

          this.messageService.add({
            severity: 'success',
            summary: 'Venda finalizada',
            detail:
              `A venda ${venda.numero} foi finalizada.`,
          });
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

    this.processando.set(true);

    this.vendaService
      .cancelar(
        vendaId,
      )
      .pipe(
        finalize(
          () =>
            this.processando.set(
              false,
            ),
        ),
        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe({
        next: venda => {

          this.venda.set(
            venda,
          );

          this.messageService.add({
            severity: 'success',
            summary: 'Venda cancelada',
            detail:
              `A venda ${venda.numero} foi cancelada.`,
          });
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

      default:
        return padrao;
    }
  }
}
