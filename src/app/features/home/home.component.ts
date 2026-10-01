import { Component, computed, effect, inject, OnInit } from '@angular/core';

import { RouterModule } from '@angular/router';

import { finalize } from 'rxjs';

import { PdfService } from '../../services/pdf';

import { DashboardComponent } from '../dash-board/dash-board.component';

import { DashboardVendasCardComponent } from '../dash-board/components/dashboard-vendas-card/dashboard-vendas-card.component';

import { DashboardService } from '../dash-board/services/dashboard';

import {
  DashboardOrdemServicoDTO,
  MetricaOrdemServicoDTO,
} from '../dash-board/model/dashboard-ordem-servico.dto';

import { DashboardVendaDTO } from '../dash-board/model/dashboard-venda.dto';

import { AuthStore } from '../security/store/auth.store';

import { PERMISSOES } from '../security/model/permissoes';

@Component({
  selector: 'app-home',

  standalone: true,

  imports: [RouterModule, DashboardComponent, DashboardVendasCardComponent],

  templateUrl: './home.component.html',

  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private readonly pdfService = inject(PdfService);

  private readonly dashboardService = inject(DashboardService);

  private readonly authStore = inject(AuthStore);

  readonly podeVisualizarDashboardVendas = computed(() =>
    this.authStore.possuiPermissao(PERMISSOES.VENDA.DASHBOARD),
  );

  private readonly carregarDashboardVendasQuandoPermitido = effect(() => {
    if (!this.authStore.carregado()) {
      return;
    }

    if (!this.podeVisualizarDashboardVendas()) {
      return;
    }

    this.carregarMetricasVendas();
  });

  /*
   * ORDENS DE SERVIÇO
   */

  metricas: DashboardOrdemServicoDTO | null = null;

  carregandoOrdens = false;

  erroOrdens: string | null = null;

  /*
   * VENDAS
   */

  metricasVendas: DashboardVendaDTO | null = null;

  carregandoVendas = false;

  erroVendas: string | null = null;

  /*
   * ESTADO GERAL
   */

  get carregandoMetricas(): boolean {
    return this.carregandoOrdens || this.carregandoVendas;
  }

  ngOnInit(): void {
    this.carregarMetricas();
  }

  carregarMetricas(): void {
    this.carregarMetricasOrdensServico();
  }

  /*
   * ORDENS DE SERVIÇO
   */

  private carregarMetricasOrdensServico(): void {
    this.iniciarCarregamentoOrdens();

    this.dashboardService
      .buscarMetricasOrdensServico()
      .pipe(finalize(() => (this.carregandoOrdens = false)))
      .subscribe({
        next: (response) => (this.metricas = response),

        error: (error) => this.tratarErroOrdens(error),
      });
  }

  private iniciarCarregamentoOrdens(): void {
    this.carregandoOrdens = true;

    this.erroOrdens = null;
  }

  private tratarErroOrdens(error: unknown): void {
    console.error('Erro ao carregar métricas de ordens de serviço:', error);

    this.erroOrdens = 'Não foi possível carregar as métricas de ordens de serviço.';
  }

  /*
   * VENDAS
   */

  private carregarMetricasVendas(): void {
    this.iniciarCarregamentoVendas();

    this.dashboardService
      .buscarMetricasVendas()
      .pipe(finalize(() => (this.carregandoVendas = false)))
      .subscribe({
        next: (response) => (this.metricasVendas = response),

        error: (error) => this.tratarErroVendas(error),
      });
  }

  private iniciarCarregamentoVendas(): void {
    this.carregandoVendas = true;

    this.erroVendas = null;
  }

  private tratarErroVendas(error: unknown): void {
    console.error('Erro ao carregar métricas de vendas:', error);

    this.erroVendas = 'Não foi possível carregar as métricas de vendas.';
  }

  /*
   * PERÍODOS
   */

  formatarPeriodo(metrica: MetricaOrdemServicoDTO): string {
    return `${this.formatarData(metrica.inicio)} a ${this.formatarData(metrica.fim)}`;
  }

  private formatarData(data: string): string {
    if (!data) {
      return '';
    }

    const [ano, mes, dia] = data.split('-');

    if (!ano || !mes || !dia) {
      return data;
    }

    return `${dia}/${mes}/${ano}`;
  }

  /*
   * PDF
   */

  gerarPdf(): void {
    this.pdfService.downloadPdf().subscribe((blob) => this.baixarArquivo(blob, 'relatorio.pdf'));
  }

  gerarPdfTeste(): void {
    this.pdfService
      .downloadPdfTeste()
      .subscribe((blob) => this.baixarArquivo(blob, 'relatorio-teste.pdf'));
  }

  private baixarArquivo(blob: Blob, nomeArquivo: string): void {
    const fileURL = window.URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = fileURL;

    link.download = nomeArquivo;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(fileURL);
  }

  recarregarMetricasVendas(): void {
    if (!this.podeVisualizarDashboardVendas()) {
      return;
    }

    this.carregarMetricasVendas();
  }
}
