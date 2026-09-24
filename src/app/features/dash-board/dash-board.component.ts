import {
  Component,
  Input,
  OnChanges,
} from '@angular/core';

import {
  ChartModule,
} from 'primeng/chart';

import {
  MetricaEntregasTecnicoDTO,
} from './model/dashboard-ordem-servico.dto';


@Component({
  selector: 'app-dashboard-metrica',

  standalone: true,

  imports: [
    ChartModule,
  ],

  templateUrl: './dash-board.component.html',

  styleUrl: './dash-board.component.css',
})
export class DashboardComponent
  implements OnChanges {

    @Input()
    tecnicos: MetricaEntregasTecnicoDTO[] = [];



    @Input()
somenteEntregues = false;
  @Input()
  titulo = '';

  @Input()
  subtitulo = '';

  @Input()
  abertas = 0;

  @Input()
  autorizadas = 0;

  @Input()
  entregues = 0;

  @Input()
  naoAutorizadas = 0;


  data: any;

  options: any;


  ngOnChanges(): void {

    this.carregarGrafico();

  }


  get total(): number {
    if (this.somenteEntregues) {
      return this.entregues;
    }

    return (
      this.abertas +
      this.autorizadas +
      this.entregues +
      this.naoAutorizadas
    );
  }


  private carregarGrafico(): void {

    this.data = {
      labels: this.somenteEntregues
        ? ['Entregues']
        : [
            'Abertas',
            'Autorizadas',
            'Entregues',
            'Não autorizadas',
          ],

      datasets: [
        {
          data: this.somenteEntregues
            ? [this.entregues]
            : [
                this.abertas,
                this.autorizadas,
                this.entregues,
                this.naoAutorizadas,
              ],

          backgroundColor: this.somenteEntregues
            ? ['#0F766E']
            : [
                '#3B82F6',
                '#22C55E',
                '#0F766E',
                '#F97316',
              ],

          borderColor: '#FFFFFF',
          borderWidth: 3,
          hoverOffset: 6,
        },
      ],
    };


    this.options = {

      responsive:
        true,

      maintainAspectRatio:
        false,

      cutout:
        '70%',

      animation: {
        duration:
          500,
      },

      plugins: {

        legend: {
          display:
            false,
        },

        tooltip: {

          callbacks: {

            label:
              (context: any) => {

                const valor =
                  Number(
                    context.raw ?? 0,
                  );

                const percentual =
                  this.total > 0
                    ? (
                        (
                          valor /
                          this.total
                        ) *
                        100
                      ).toFixed(1)
                    : '0.0';

                return (
                  `${context.label}: ` +
                  `${valor} ` +
                  `(${percentual}%)`
                );

              },

          },

        },

      },

    };

  }

  private readonly formatoMoeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  formatarMoeda(valor: number): string {
    return this.formatoMoeda.format(valor);
  }

}
