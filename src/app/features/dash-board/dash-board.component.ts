import {
  Component,
  Input,
  OnChanges,
} from '@angular/core';

import {
  ChartModule,
} from 'primeng/chart';


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

    return (
      this.abertas +
      this.autorizadas +
      this.entregues +
      this.naoAutorizadas
    );

  }


  private carregarGrafico(): void {

    this.data = {

      labels: [
        'Abertas',
        'Autorizadas',
        'Entregues',
        'Não autorizadas',
      ],

      datasets: [
        {

          data: [
            this.abertas,
            this.autorizadas,
            this.entregues,
            this.naoAutorizadas,
          ],

          backgroundColor: [
            '#3B82F6',
            '#22C55E',
            '#0F766E',
            '#F97316',
          ],

          borderColor:
            '#FFFFFF',

          borderWidth:
            3,

          hoverOffset:
            6,

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

}