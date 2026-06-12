import { RouterModule } from '@angular/router';
import { Component, Input, OnChanges } from '@angular/core';
import { ChartModule } from 'primeng/chart';


@Component({
  selector: 'app-dashboard-metrica',
  standalone: true,
  imports: [
    RouterModule,
    ChartModule
  ],
  templateUrl: './dash-board.component.html',
  styleUrl: './dash-board.component.css'
})
export class DashboardComponent implements OnChanges {

  @Input() aparelhosProntos = 0;
  @Input() aparelhosNaoAutorizados = 0;
  @Input() aparelhosDevolvidos = 0;

  data: any;
  options: any;

  ngOnChanges(): void {
    this.carregarGrafico();
  }

  private carregarGrafico(): void {

    const documentStyle = getComputedStyle(document.documentElement);

    this.data = {
      labels: [
        'Prontos',
        'Não Autorizados',
        'Devolvidos'
      ],
      datasets: [
        {
          data: [
            this.aparelhosProntos,
            this.aparelhosNaoAutorizados,
            this.aparelhosDevolvidos
          ],
       backgroundColor: [
  '#22C55E', // Verde
  '#F59E0B', // Laranja
  '#3B82F6'  // Azul
],
borderColor: '#FFFFFF',
borderWidth: 2
        }
      ]
    };

    this.options = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      position: 'bottom'
    },
    title: {
      display: true,
      text: 'Situação dos Aparelhos'
    }
  }
};
  }
}