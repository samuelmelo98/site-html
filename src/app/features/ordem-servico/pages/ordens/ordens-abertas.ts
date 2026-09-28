import {
  Component,
  inject,
  signal,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

import {
  Router,
} from '@angular/router';

import {
  TableLazyLoadEvent,
  TableModule,
} from 'primeng/table';

import {
  ButtonModule,
} from 'primeng/button';

import {
  TagModule,
} from 'primeng/tag';

import {
  TooltipModule,
} from 'primeng/tooltip';

import {
  OrdemServicoService,
} from '../../services/ordem-servico.service';

import {
  OrdemServicoAbertaDTO,
} from '../../model/ordem-servico-aberta.dto';


@Component({

  selector: 'app-orders-abertas',

  standalone: true,

  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
  ],

  templateUrl:
    './ordens-abertas.html',

  styleUrl:
    './ordens-abertas.css',

})
export class OrdensAbertasComponent {

  private readonly ordemServicoService =
    inject(
      OrdemServicoService,
    );

  private readonly router =
    inject(
      Router,
    );


  readonly ordens =
    signal<
      OrdemServicoAbertaDTO[]
    >(
      [],
    );


  readonly carregando =
    signal(
      false,
    );


  readonly totalRegistros =
    signal(
      0,
    );


  readonly tamanhoPagina =
    signal(
      10,
    );


  carregarPagina(
    event: TableLazyLoadEvent,
  ): void {

    const first =
      event.first ?? 0;

    const rows =
      event.rows ?? 10;

    const page =
      Math.floor(
        first / rows,
      );

    this.carregar(
      page,
      rows,
    );

  }


  carregar(
    page = 0,
    size = this.tamanhoPagina(),
  ): void {

    this.carregando.set(
      true,
    );

    this.ordemServicoService
      .listarAbertas(
        page,
        size,
      )
      .subscribe({

        next: response => {

          this.ordens.set(
            response.content,
          );

          this.totalRegistros.set(
            response.totalElements,
          );

          this.tamanhoPagina.set(
            response.size,
          );

          this.carregando.set(
            false,
          );

        },

        error: error => {

          console.error(
            'Erro ao carregar ordens abertas',
            error,
          );

          this.ordens.set(
            [],
          );

          this.totalRegistros.set(
            0,
          );

          this.carregando.set(
            false,
          );

        },

      });

  }


  abrir(
    ordemServicoId: number,
  ): void {

    this.router.navigate(
      [
        '/ordem-servico',
        ordemServicoId,
      ],
    );

  }


  descricaoAparelho(
    ordem: OrdemServicoAbertaDTO,
  ): string {

    return [
      ordem.marca,
      ordem.modelo,
      ordem.modeloComercial,
    ]
      .filter(
        value =>
          !!value,
      )
      .join(
        ' ',
      );

  }


  statusSeverity(
    status: string,
  ):
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'contrast' {

    switch (
      status
    ) {

      case 'ABERTA':
        return 'info';

      case 'EM_ANALISE':
        return 'warn';

      case 'AGUARDANDO_APROVACAO':
        return 'warn';

      case 'APROVADA':
        return 'success';

      case 'EM_EXECUCAO':
        return 'info';

      case 'CONCLUIDA':
        return 'success';

      default:
        return 'secondary';

    }

  }

}