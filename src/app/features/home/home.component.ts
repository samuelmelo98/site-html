import {
  Component,
  inject,
  OnInit,
} from '@angular/core';

import {
  RouterModule,
} from '@angular/router';

import {
  finalize,
} from 'rxjs';

import {
  PdfService,
} from '../../services/pdf';

import {
  DashboardComponent,
} from '../dash-board/dash-board.component';

import {
  DashboardService,
} from '../dash-board/services/dashboard';

import {
  DashboardOrdemServicoDTO,
  MetricaOrdemServicoDTO,
} from '../dash-board/model/dashboard-ordem-servico.dto';


@Component({
  selector: 'app-home',

  standalone: true,

  imports: [
    RouterModule,
    DashboardComponent,
  ],

  templateUrl: './home.component.html',

  styleUrl: './home.component.css',
})
export class HomeComponent
  implements OnInit {

  private readonly pdfService =
    inject(PdfService);

  private readonly dashboardService =
    inject(DashboardService);


  metricas:
    DashboardOrdemServicoDTO | null =
    null;


  carregandoMetricas =
    false;

  erroMetricas:
    string | null =
    null;


  ngOnInit(): void {

    this.carregarMetricas();

  }


  carregarMetricas(): void {

    this.carregandoMetricas =
      true;

    this.erroMetricas =
      null;


    this.dashboardService
      .buscarMetricasOrdensServico()
      .pipe(
        finalize(() => {

          this.carregandoMetricas =
            false;

        }),
      )
      .subscribe({

        next: (
          response:
            DashboardOrdemServicoDTO,
        ) => {

          this.metricas =
            response;

        },

        error: (
          error: unknown,
        ) => {

          console.error(
            'Erro ao carregar métricas do dashboard:',
            error,
          );

          this.erroMetricas =
            'Não foi possível carregar as métricas.';

        },

      });

  }


  formatarPeriodo(
    metrica:
      MetricaOrdemServicoDTO,
  ): string {

    return `${this.formatarData(
      metrica.inicio,
    )} a ${this.formatarData(
      metrica.fim,
    )}`;

  }


  gerarPdf(): void {

    this.pdfService
      .downloadPdf()
      .subscribe(
        (blob: Blob) => {

          this.baixarArquivo(
            blob,
            'relatorio.pdf',
          );

        },
      );

  }


  gerarPdfTeste(): void {

    this.pdfService
      .downloadPdfTeste()
      .subscribe(
        (blob: Blob) => {

          this.baixarArquivo(
            blob,
            'relatorio-teste.pdf',
          );

        },
      );

  }


  private formatarData(
    data: string,
  ): string {

    if (!data) {
      return '';
    }

    const [
      ano,
      mes,
      dia,
    ] =
      data.split('-');

    if (
      !ano ||
      !mes ||
      !dia
    ) {
      return data;
    }

    return `${dia}/${mes}/${ano}`;

  }


  private baixarArquivo(
    blob: Blob,
    nomeArquivo: string,
  ): void {

    const fileURL =
      window.URL.createObjectURL(
        blob,
      );

    const link =
      document.createElement(
        'a',
      );

    link.href =
      fileURL;

    link.download =
      nomeArquivo;

    document.body.appendChild(
      link,
    );

    link.click();

    link.remove();

    window.URL.revokeObjectURL(
      fileURL,
    );

  }

}