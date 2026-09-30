import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

import {
  DashboardVendaDTO,
  MetricaVendaDTO,
} from '../../model/dashboard-venda.dto';


interface LinhaVenda {
  titulo: string;
  metrica: MetricaVendaDTO;
}


@Component({
  selector:
    'app-dashboard-vendas-card',

  standalone:
    true,

  templateUrl:
    './dashboard-vendas-card.component.html',

  styleUrl:
    './dashboard-vendas-card.component.css',

  changeDetection:
    ChangeDetectionStrategy.OnPush,
})
export class DashboardVendasCardComponent {

  @Input({
    required: true,
  })
  dados!: DashboardVendaDTO;


  private readonly formatoMoeda =
    new Intl.NumberFormat(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL',
      },
    );


  get linhas():
    LinhaVenda[] {

    return [
      {
        titulo: 'Hoje',
        metrica:
          this.dados.diaria,
      },
      {
        titulo: 'Semana',
        metrica:
          this.dados.semanal,
      },
      {
        titulo: 'Mês',
        metrica:
          this.dados.mensal,
      },
      {
        titulo: 'Ano',
        metrica:
          this.dados.anual,
      },
    ];
  }


  formatarMoeda(
    valor: number,
  ): string {

    return this.formatoMoeda
      .format(
        valor ?? 0,
      );
  }

}