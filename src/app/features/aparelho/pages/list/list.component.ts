import { DatePipe } from '@angular/common';
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

import { Subscription, finalize } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import {
  Table,
  TableLazyLoadEvent,
  TableModule,
} from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { AparelhoService } from '../../services/aparelho.service';

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
    TableModule,
    ButtonModule,
    TooltipModule,
  ],
  templateUrl: './list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnChanges {
  readonly clienteId = input.required<number>();

  readonly dados2 = signal<AparelhoLinha[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly erro = signal('');

  private readonly aparelhoService = inject(AparelhoService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly tabela = viewChild<Table>('tabela');

  private requisicao?: Subscription;
  private termoBusca = '';

  ngOnChanges(changes: SimpleChanges): void {
    const alteracao = changes['clienteId'];

    // A primeira consulta é disparada pelo lazy load da tabela.
    if (alteracao && !alteracao.firstChange) {
      this.dados2.set([]);
      this.total.set(0);
      this.recarregar();
    }
  }

  buscar(valor: string): void {
    this.termoBusca = valor.trim();
    this.recarregar();
  }

  recarregar(): void {
    this.tabela()?.reset();
  }

  carregar(event: TableLazyLoadEvent): void {
    this.requisicao?.unsubscribe();

    const clienteId = this.clienteId();

    if (!Number.isSafeInteger(clienteId) || clienteId <= 0) {
      this.dados2.set([]);
      this.total.set(0);
      this.erro.set('Identificador do cliente inválido.');
      return;
    }

    const size = Math.max(1, event.rows ?? 10);
    const first = Math.max(0, event.first ?? 0);
    const page = Math.floor(first / size);

    const sortField = Array.isArray(event.sortField)
      ? event.sortField[0] || 'aparelhoId'
      : event.sortField || 'aparelhoId';

    const sortOrder = event.sortOrder === -1 ? 'desc' : 'asc';

    this.loading.set(true);
    this.erro.set('');

    this.requisicao = this.aparelhoService
      .listarPaginado(
        page,
        size,
        sortField,
        sortOrder,
        this.termoBusca,
        clienteId,
      )
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: resposta => {
          this.dados2.set(resposta.content);
          this.total.set(resposta.totalElements);
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

  textoStatus(status: unknown): string {
    if (typeof status === 'string') {
      return status || '—';
    }

    if (typeof status === 'object' && status !== null) {
      if ('descricao' in status && typeof status.descricao === 'string') {
        return status.descricao;
      }

      if ('nome' in status && typeof status.nome === 'string') {
        return status.nome;
      }
    }

    return '—';
  }
}
