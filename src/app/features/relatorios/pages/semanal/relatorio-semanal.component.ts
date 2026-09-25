import {
  CurrencyPipe,
  DatePipe,
} from '@angular/common';

import {
  HttpErrorResponse,
} from '@angular/common/http';

import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  finalize,
  Observable,
} from 'rxjs';

import {
  ButtonModule,
} from 'primeng/button';

import {
  ProgressSpinnerModule,
} from 'primeng/progressspinner';

import {
  FormaPagamento,
  RelatorioSemanalTecnicoDTO,
  RelatorioSemanalTecnicoItemDTO,
} from '../../model/relatorio-semanal-tecnico.dto';

import {
  RelatorioSemanalTecnicoService,
} from '../../services/relatorio-semanal-tecnico.service';

import {
  TecnicoService,
} from '../../../ordem-servico/services/tecnico.service';

import {
  TecnicoDTO,
} from '../../../ordem-servico/model/tecnico.dto';

type ModoConsulta =
  | 'ULTIMA_SEMANA'
  | 'SEMANA_ATUAL'
  | 'PERIODO';

interface PeriodoConsulta {
  inicio: string;
  fim: string;
}

@Component({
  selector: 'app-relatorio-semanal',
  standalone: true,
  imports: [
    DatePipe,
    CurrencyPipe,
    ReactiveFormsModule,
    ButtonModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './relatorio-semanal.component.html',
  styleUrl: './relatorio-semanal.component.css',
})
export class RelatorioSemanalComponent
  implements OnInit {

  private readonly destroyRef =
    inject(DestroyRef);

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly service =
    inject(RelatorioSemanalTecnicoService);

  private readonly tecnicoService =
    inject(TecnicoService);


  readonly carregando =
    signal(false);

  readonly carregandoTecnicos =
    signal(false);

  readonly erro =
    signal('');

  readonly relatorios =
    signal<RelatorioSemanalTecnicoDTO[]>([]);

  readonly tecnicos =
    signal<TecnicoDTO[]>([]);

  readonly tecnicoSelecionadoId =
    signal<number | null>(
      null,
    );

  readonly periodoConsultado =
    signal<PeriodoConsulta | null>(
      null,
    );

  readonly modoConsulta =
    signal<ModoConsulta>(
      'ULTIMA_SEMANA',
    );


  readonly formPeriodo =
    this.formBuilder.nonNullable.group({

      inicio: [
        '',
        [
          Validators.required,
        ],
      ],

      fim: [
        '',
        [
          Validators.required,
        ],
      ],

    });


  readonly quantidadeTecnicos =
    computed(
      () => this.relatorios().length,
    );

  readonly quantidadeAparelhos =
    computed(
      () =>
        this.relatorios()
          .reduce(
            (
              total,
              relatorio,
            ) =>
              total +
              relatorio.aparelhos.length,
            0,
          ),
    );

  readonly totalOrdensServico =
    computed(
      () =>
        this.relatorios()
          .reduce(
            (
              total,
              relatorio,
            ) =>
              total +
              relatorio.totalOrdensServico,
            0,
          ),
    );

  readonly totalMateriais =
    computed(
      () =>
        this.relatorios()
          .reduce(
            (
              total,
              relatorio,
            ) =>
              total +
              relatorio.totalMateriais,
            0,
          ),
    );

  readonly totalTecnicos =
    computed(
      () =>
        this.relatorios()
          .reduce(
            (
              total,
              relatorio,
            ) =>
              total +
              relatorio.valorTecnico,
            0,
          ),
    );


  ngOnInit(): void {

    this.carregarTecnicos();

    this.carregarUltimaSemana();
  }


  selecionarTecnico(
    event: Event,
  ): void {

    const elemento =
      event.target as HTMLSelectElement;

    const valor =
      elemento.value;

    if (!valor) {

      this.tecnicoSelecionadoId.set(
        null,
      );

      return;
    }

    const tecnicoId =
      Number(valor);

    if (
      !Number.isSafeInteger(tecnicoId) ||
      tecnicoId <= 0
    ) {

      this.tecnicoSelecionadoId.set(
        null,
      );

      return;
    }

    this.tecnicoSelecionadoId.set(
      tecnicoId,
    );
  }


  carregarUltimaSemana(): void {

    const periodo =
      this.calcularUltimaSemanaCompleta();

    this.modoConsulta.set(
      'ULTIMA_SEMANA',
    );

    this.aplicarPeriodoNoFormulario(
      periodo,
    );

    this.executarConsulta(
      this.service.buscarSemanal(
        this.tecnicoSelecionadoId(),
      ),
      periodo,
    );
  }


  carregarSemanaAtual(): void {

    const periodo =
      this.calcularSemanaAtual();

    this.modoConsulta.set(
      'SEMANA_ATUAL',
    );

    this.aplicarPeriodoNoFormulario(
      periodo,
    );

    this.executarConsulta(
      this.service.buscarPorPeriodo(
        periodo.inicio,
        periodo.fim,
        this.tecnicoSelecionadoId(),
      ),
      periodo,
    );
  }


  consultarPeriodo(): void {

    if (
      this.formPeriodo.invalid
    ) {

      this.formPeriodo
        .markAllAsTouched();

      return;
    }

    const {
      inicio,
      fim,
    } =
      this.formPeriodo
        .getRawValue();

    if (
      fim < inicio
    ) {

      this.erro.set(
        'A data final não pode ser anterior à data inicial.',
      );

      return;
    }

    this.modoConsulta.set(
      'PERIODO',
    );

    const periodo: PeriodoConsulta = {
      inicio,
      fim,
    };

    this.executarConsulta(
      this.service.buscarPorPeriodo(
        inicio,
        fim,
        this.tecnicoSelecionadoId(),
      ),
      periodo,
    );
  }


  atualizar(): void {

    switch (
      this.modoConsulta()
    ) {

      case 'ULTIMA_SEMANA':

        this.carregarUltimaSemana();

        return;

      case 'SEMANA_ATUAL':

        this.carregarSemanaAtual();

        return;

      case 'PERIODO':

        this.consultarPeriodo();

        return;
    }
  }


  imprimir(): void {

    window.print();
  }


  descricaoAparelho(
    item: RelatorioSemanalTecnicoItemDTO,
  ): string {

    const descricao = [
      item.modeloComercial,
      item.modelo,
    ]
      .map(
        valor =>
          valor?.trim(),
      )
      .filter(
        (
          valor,
        ): valor is string =>
          Boolean(valor),
      )
      .join(' - ');

    return (
      descricao ||
      `Aparelho #${item.aparelhoId}`
    );
  }


  nomeFormaPagamento(
    forma: FormaPagamento,
  ): string {

    switch (
      forma
    ) {

      case 'DINHEIRO':

        return 'Dinheiro';

      case 'PIX':

        return 'PIX';

      case 'CARTAO_DEBITO':

        return 'Cartão de débito';

      case 'CARTAO_CREDITO':

        return 'Cartão de crédito';

      case 'TRANSFERENCIA':

        return 'Transferência';

      default:

        return forma;
    }
  }


  private carregarTecnicos(): void {

    this.carregandoTecnicos.set(
      true,
    );

    this.tecnicoService
      .listar()
      .pipe(

        finalize(() =>
          this.carregandoTecnicos.set(
            false,
          ),
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),

      )
      .subscribe({

        next: tecnicos => {

          const lista =
            tecnicos ?? [];

          this.tecnicos.set(
            [...lista]
              .sort(
                (
                  a,
                  b,
                ) =>
                  (
                    a.nome ?? ''
                  )
                    .localeCompare(
                      b.nome ?? '',
                      'pt-BR',
                    ),
              ),
          );
        },

        error: (
          erro: HttpErrorResponse,
        ) => {

          console.error(
            'Erro ao carregar técnicos:',
            erro,
          );

        },

      });
  }


  private executarConsulta(
    requisicao:
      Observable<
        RelatorioSemanalTecnicoDTO[]
      >,
    periodo: PeriodoConsulta,
  ): void {

    this.carregando.set(
      true,
    );

    this.erro.set(
      '',
    );

    this.periodoConsultado.set(
      periodo,
    );

    requisicao
      .pipe(

        finalize(() =>
          this.carregando.set(
            false,
          ),
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),

      )
      .subscribe({

        next: relatorios => {

          this.relatorios.set(
            relatorios ?? [],
          );

        },

        error: (
          erro: HttpErrorResponse,
        ) => {

          console.error(
            'Erro ao carregar relatório:',
            erro,
          );

          this.relatorios.set(
            [],
          );

          this.erro.set(
            erro.error?.detail ??
            erro.error?.message ??
            'Não foi possível carregar o relatório.',
          );

        },

      });
  }


  private aplicarPeriodoNoFormulario(
    periodo: PeriodoConsulta,
  ): void {

    this.formPeriodo.setValue({
      inicio: periodo.inicio,
      fim: periodo.fim,
    });
  }


  private calcularUltimaSemanaCompleta():
    PeriodoConsulta {

    const segundaAtual =
      this.calcularSegundaFeira(
        new Date(),
      );

    const inicio =
      new Date(
        segundaAtual,
      );

    inicio.setDate(
      inicio.getDate() - 7,
    );

    const fim =
      new Date(
        inicio,
      );

    fim.setDate(
      fim.getDate() + 5,
    );

    return {
      inicio:
        this.formatarDataISO(
          inicio,
        ),
      fim:
        this.formatarDataISO(
          fim,
        ),
    };
  }


  private calcularSemanaAtual():
    PeriodoConsulta {

    const inicio =
      this.calcularSegundaFeira(
        new Date(),
      );

    const fim =
      new Date(
        inicio,
      );

    fim.setDate(
      fim.getDate() + 5,
    );

    return {
      inicio:
        this.formatarDataISO(
          inicio,
        ),
      fim:
        this.formatarDataISO(
          fim,
        ),
    };
  }


  private calcularSegundaFeira(
    data: Date,
  ): Date {

    const resultado =
      new Date(
        data,
      );

    resultado.setHours(
      0,
      0,
      0,
      0,
    );

    const diaSemana =
      resultado.getDay();

    const diasDesdeSegunda =
      (
        diaSemana + 6
      ) % 7;

    resultado.setDate(
      resultado.getDate() -
      diasDesdeSegunda,
    );

    return resultado;
  }


  private formatarDataISO(
    data: Date,
  ): string {

    const ano =
      data.getFullYear();

    const mes =
      String(
        data.getMonth() + 1,
      )
        .padStart(
          2,
          '0',
        );

    const dia =
      String(
        data.getDate(),
      )
        .padStart(
          2,
          '0',
        );

    return `${ano}-${mes}-${dia}`;
  }
}
